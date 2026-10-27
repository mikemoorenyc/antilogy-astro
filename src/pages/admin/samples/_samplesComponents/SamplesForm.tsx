import React, { useMemo, useRef, useState,useEffect } from "react";
import { SampleImage, type TSampleImage, type TSampleSettings } from "@/actions/settings/schema";
import FormContainer from "../../_adminComponents/formelements/FormContainer";
import FormInput from "../../_adminComponents/formelements/FormInput";
import RTEditor from "../../_adminComponents/formelements/RTEditor";
import SampleItem from "./SampleItem";
import {DragDropProvider} from '@dnd-kit/react';
import {move} from '@dnd-kit/helpers';
import ReactButton from "@/components/Button/ReactButton";

import SaveFooter from "../../_adminComponents/formelements/SaveFooter";
import ModalContainer from "@/components/ModalContainer/ModalContainer";

import { actions } from 'astro:actions';
export default function (props: TSampleSettings) {
  type TClientSample = TSampleImage & {
    loaded?:boolean
  }
  const [editingImage,updateEditingImage] = useState<null|number>(null)
  const [images, updateImages] = useState<TClientSample[]>(props.sampleImages);
  const [uploadQueue, updateUploadQueue] = useState<{ file: File, id: number, finished: boolean, cloud_id: string }[]>([])
  const [deleteQueue, updateDeleteQueue] = useState<{id:number,cloud_id:string,deleted?:boolean}[]>([])
  const [pageTitle, updatePageTitle] = useState(props.pageTitle);
  const [pageIntro, updatePageIntro] = useState(props.pageIntro || "")
  const uploadInput = useRef<null | HTMLInputElement>(null);
  const [formUpdated, updateFormUpdated] = useState(false);
  const [saveState, updateSaveState] = useState<"idle" | "uploading" | "pending">("idle")
  const isPending = useMemo(()=>saveState === "pending",[saveState])
  const beforeUnload = (e:BeforeUnloadEvent) => {
    e.preventDefault();
  }
  useEffect(()=> {
    if(import.meta.env.DEV) return ;
    if(!formUpdated) {
      window.removeEventListener('beforeunload', beforeUnload);
      return;
    }
    window.addEventListener('beforeunload', beforeUnload);
      return ()=> {
        window.removeEventListener('beforeunload', beforeUnload);
      }
  }, [formUpdated])
  useEffect(() => {
    let isUpdated = false;

    const og = JSON.stringify({ images: props.sampleImages, pageIntro: props.pageIntro || "", pageTitle: props.pageTitle })
    const newg = JSON.stringify({ images, pageIntro, pageTitle });
    if (og !== newg) {
      isUpdated = true
    }
    updateFormUpdated(isUpdated)

  },[images,pageIntro,pageTitle])



  const updateAltText = (id: number, text: string) => {
    updateImages(prev => {
      return prev.map(i => {
        if (i.id !== id) return i;
        return {...i, ...{altText:text}}
      })
    })
  }
  const deleteImage = (sendid: number) => {
    if (!confirm("Are you sure you want to delete this? It can't be undone")) {
      return;
    }
    const img = images.find(i => i.id == sendid);
    if (!img) {
      alert("Couldn't delete image");
      return;
    }
    const { id, loaded } = img;
    //Remove from upload Queue
    if (uploadQueue.find(u => u.id == id)) {
      updateUploadQueue(prev => prev.filter(u => u.id !== id));
    }
    if (loaded) {
      updateDeleteQueue(prev => [...prev, ...[img]]);
    }
    updateImages(prev => prev.filter(i => i.id !== id));

    //Figure out deleting


  }
  const imageUploaded = (e: React.ChangeEvent<HTMLInputElement>) => {
    const t = e.target;
    if (!t.files || t.files.length > 1) {
      alert("Couldn't add file");
      return;
    }
    const f = t.files[0];
    console.log(f);
    const reader = new FileReader();
    reader.onloadend = (e) => {
      if (!e.target?.result||typeof e.target.result !== "string") {
        alert("Couldn't add file");
        return;
      }
      const id = Date.now()
      const cloud_id = `samples/${f.name.replace(".jpg","").replace(".jpeg","")}_${id}`
      const newImg = {
        id,
        url: e.target.result,
        altText: "A graphic of a shirt",
        loaded: false,
        cloud_id
      }
      updateImages(prev => {
        return [...prev, ...[newImg]]
      })
      updateUploadQueue(prev => [...prev,...[{file:f,id,finished:false,cloud_id}]])
    }
    reader.readAsDataURL(f);

  }
  const itemsToUpload = useMemo(() => images.filter(i => i.loaded === false), [images]);

  const saveAction = async () => {
    const emptyalts = images.filter(i => !i.altText || i.altText.length < 1);
    if (emptyalts.length > 0) {
      alert("You need to fill in all alt text");
      return;
    }
    if (deleteQueue.length || uploadQueue.length) {
      updateSaveState("uploading");
      const uploadPromises = uploadQueue.map(u => {

        return async () => {
          const { data, error } = await actions.media.generateSignature({ public_id: u.cloud_id });
          if (error) {
            throw new Error("Couldn't generate sig " + String(error));
          }
          const uploadForm = new FormData();
          Object.keys(data).forEach(key => {
            const value = data[key];
             uploadForm.append(key, value);
          });
          uploadForm.append("file", u.file);
          try {
            const uploadResponse = await fetch(`https://api.cloudinary.com/v1_1/${data.cloud_name}/image/upload`, {
              method: 'POST',
              body: uploadForm,
            });
            const {url} = await uploadResponse.json();
            updateImages((prev) => {
              return prev.map(i => {
                if (i.id !== u.id) return i
                return {...i, ...{url}}
              })
            })
            updateUploadQueue(prev => {
              return prev.map(up => {
                if (up.id !== u.id) return up;
                return {...up,...{finished:true}}
              })
            })
            return `uploaded__${u.cloud_id}`

          } catch (err) {
            throw new Error("Couldn't upload image: "+String(err))
          }

        }
      })
      const deletePromises = deleteQueue.map(d => {
        return async () => {
          const { data, error } = await actions.media.deleteMedia({ items: d.cloud_id });
          if (error) {
            throw new Error(`Couldn't delete item: ${d.cloud_id} ::${String(error)}`)
          }
          updateDeleteQueue(prev => {
            return prev.map(del => {
              if (del.id !== d.id) return del;
              return {...del,...{deleted:true}}
            })
          });
          return `deleted__${d.cloud_id}`
        }
      })
      try {
        const cloudUpdates = await Promise.all([...deletePromises, ...uploadPromises]);
      } catch (err) {
        alert("Couldn't update: " + String(err));
        updateSaveState("idle");
        return;
      }

    }

    updateSaveState("pending");
    const { data, error } = await actions.settings.updateSampleSettings(
      {
        sampleImages: images,
        pageIntro,
        pageTitle
      }
    );
    updateSaveState("idle")
    if (error) {
      alert("Couldn't update sample settings: " + String(error));

      return;
    }

    alert("Settings saved");
    location.reload()
    return;

    //updateSaveState("uploading")
  }

  return <form className="max-w-screen-lg" onSubmit={(e) => { e.preventDefault() }}>
    <div className="border border-foreground p-4 mb-4 overflow-hidden">
      <DragDropProvider onDragOver={(event) => {
              updateImages((items) => move(items, event));
            }}>
      <ul className="grid grid-cols-2 grid-flow-row gap-4 [&:not(:empty)]:mb-4">
        {images.map((image, index) => {
          return <SampleItem  key={image.id} {...{index,image,updateEditingImage,editingImage,updateAltText,deleteImage}} ></SampleItem>
        })}
        </ul>
      </DragDropProvider>
      <div>
        <input type="file" ref={uploadInput} accept="image/jpeg" style={ {display:"none"}}onChange={imageUploaded}/>
        <ReactButton label="Add sample" icon={<span className="icon-[carbon--add] w-4 h-4" />} onClick={() => {
          if (uploadInput && uploadInput.current) {
            uploadInput.current.click();
          }
        }}/>
      </div>
    </div>
    <FormContainer formId="pageTitle" label="Page title">
      <FormInput forValue="pageTitle" type="text" required={true} value={pageTitle} onChange={(i:string)=>{updatePageTitle(i)}}/>
    </FormContainer>
    <FormContainer formId="pageIntro" label="Page intro">
      <RTEditor content={pageIntro} updateCallback={updatePageIntro} />

    </FormContainer>

    {saveState=="idle"&&<SaveFooter
      saveText="Save"
      {...{beforeUnload,saveAction,isPending}}
    />}
    <div>{itemsToUpload.length}</div>
    {saveState === "uploading" && <ModalContainer>
      <div className="p-gutter">
        <h2 className="text-lg mb-3"><strong>Saving images. Don't close this tab!</strong></h2>
        <h3 className="mb-2">Uploading</h3>
        <ul className="mb-3">
          <li className="flex items-center mb-1">
            <div>
              <span className="w-4 h-4" />
            </div>
            <div className="flex-1 ml-2 font-serif">a24.jpg</div>
          </li>

        </ul>
      </div>

      <button onClick={(e) => { e.preventDefault();updateSaveState("idle") }}>click</button>
    </ModalContainer>}
  </form>
}
