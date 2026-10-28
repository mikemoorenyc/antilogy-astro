import React, { useMemo, useRef, useState,useEffect } from "react";
import { SampleImage, type TSampleImage, type TSampleSettings } from "@/actions/settings/schema";
import FormContainer from "../../_adminComponents/formelements/FormContainer";
import FormInput from "../../_adminComponents/formelements/FormInput";
import RTEditor from "../../_adminComponents/formelements/RTEditor";
import SampleItem from "./SampleItem";
import {DragDropProvider} from '@dnd-kit/react';
import {move} from '@dnd-kit/helpers';
import ReactButton from "@/components/Button/ReactButton";
import useSaveWarning from "../../_adminComponents/_hooks/useSaveWarning";
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
  const isPending = useMemo(() => saveState === "pending", [saveState])
  const currentValue = useMemo(() => JSON.stringify({ images, pageIntro, pageTitle }),[images,pageIntro,pageTitle])
  const { removeSaveWarning, beforeunload } = useSaveWarning(JSON.stringify({ images: props.sampleImages, pageIntro: props.pageIntro || "", pageTitle: props.pageTitle }),currentValue);





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
    let size = (f.size / (1024 * 1024))
    if(size > 8) {
      alert(`${f.name} is too big. Must be less than 10mb`)
      return ;
    }
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
        altText: "A graphic on a shirt",
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
    let updatedImages = [...images];

    if (uploadQueue.length) {
      updateSaveState("uploading")
      for (const u of uploadQueue) {
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
          const { url } = await uploadResponse.json();

          updatedImages = updatedImages.map(i => {

            if (i.id !== u.id) return i
            console.log({ ...i, ...{ url } })
            const newone = { ...i, ...{ url } }
            return newone;
          })

          updateImages(updatedImages);

          updateUploadQueue(prev => {
            return prev.map(up => {
              if (up.id !== u.id) return up;
              return {...up,...{finished:true}}
            })
          })
        } catch (err) {
          throw new Error("Couldn't upload image: "+String(err))
        }
      }
    }
    if (deleteQueue.length) {
      updateSaveState("uploading");
      const { data, error } = await actions.media.deleteMedia({ items: deleteQueue.map(d => d.cloud_id) })
      updateDeleteQueue(prev => {
        return prev.map(d => {
          return {...d,...{deleted:true}}
        })
      })
      if (error) {
        throw new Error("Couldn't delete: " + String(error));
      }
    }


    updateSaveState("pending");


    const { data, error } = await actions.settings.updateSampleSettings(
      {
        sampleImages: updatedImages,
        pageIntro,
        pageTitle
      }
    );
    updateSaveState("idle")
    if (error) {
      alert("Couldn't update sample settings: " + String(error));

      return;
    }
    removeSaveWarning();
    updateSaveState("idle")
    alert("Settings saved");
    window.location.href = window.location.href;
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

   <SaveFooter
      saveText="Save"
      {...{beforeUnload:beforeunload,saveAction,isPending}}
    />

    {saveState === "uploading" && <ModalContainer>
      <div className="p-gutter">
        <h2 className="text-lg mb-3"><strong>Saving images. Don't close this tab!</strong></h2>
        {uploadQueue.length > 0 && <>
          <h3 className="mb-2">Uploading</h3>
          <ul className="mb-3">
            {uploadQueue.map(u => {
              return <li key={ u.id} className="flex items-center mb-1">

                 <span className={`size-4 ${u.finished?"text-action":""} ${u.finished?"icon-[carbon--checkmark-filled]":"icon-[carbon--cloud-upload]"}`} />

               <div className="flex-1 ml-2 font-serif">{u.file.name}</div>
             </li>
           })}

          </ul>
        </>}
        {deleteQueue.length > 0 && <>
          <h3 className="mb-2">Deleting</h3>
          <ul className="mb-3">
            {deleteQueue.map(u => {
              return <li key={ u.cloud_id} className="flex items-center mb-1">

                 <span className={`size-4 ${u.deleted?"text-action":""} ${u.deleted?"icon-[carbon--checkmark-filled]":"icon-[carbon--trash-can]"}`} />

               <div className="flex-1 ml-2 font-serif">{u.cloud_id}</div>
             </li>
           })}

          </ul>
        </>}
      </div>

    </ModalContainer>}
  </form>
}
