import FormContainer from "./formelements/FormContainer"
import { useDialog,DialogProvider } from "@/components/Dialog/Dialog"
import { useState,useEffect, type SyntheticEvent, useMemo } from "react"
import FormInput from "./formelements/FormInput"
import UploadModal from "./UploadModal";
import UploadImage from "./formelements/UploadImage"
import { actions } from "astro:actions"
import { uploader } from "../../../_lib/uploader"
import SaveFooter from "./formelements/SaveFooter"
import type { UploadApiOptions } from "cloudinary"
import useSaveWarning from "./_hooks/useSaveWarning"
import { backgroundImageAssetPrefix, type TMainSettings,imgAssetPrefix } from "@/actions/settings/schema"
import BackgroundImages from "./BackgroundImages";


type TProps = {
  settingsData: TMainSettings,
}
type TUploadItem = {
  file: File,
  settingsKey: string
}


 function SettingsForm({settingsData}:TProps) {

   const [formData, updateFormData] = useState(settingsData);
   const [backgroundImages,updateBackgroundImages] = useState(settingsData.backgroundImages)
  const [edited, updateEdited] = useState(false);
  const [settingsSent, updateSettingsSent] = useState(false);
  const [saveState, updateSaveState] = useState<"idle"|"uploading"|"saving">("idle")
  const [itemsToUpload,updateItemsToUpload] = useState<TUploadItem[]>([])
  const [modalContainer,updateModalContainer] = useState<HTMLElement|null>(null);
  const [errors,updateErrors] = useState<[string,boolean][]>([])
  const [filesToUpload, updateFilesToUpload] = useState<{ id: string, file: File,uploaded:boolean }[]>([])
   const [filesToDelete, updateFilesToDelete] = useState<{ public_id: string, deleted: boolean }[]>([])
  const currentValue = useMemo(()=>JSON.stringify({...formData,...{backgroundImages}}),[formData,backgroundImages]);
   const { removeSaveWarning, beforeunload } = useSaveWarning(JSON.stringify(settingsData), currentValue)
   const { alert, confirm } = useDialog();

  useEffect(()=> {
    if(!window) return ;
    updateModalContainer(document.getElementById("modal-container"));
  },[])



   type FormKeys = Exclude<keyof TMainSettings,"backgroundImages">;
  const updateFormValue = (value:string,key:FormKeys) => {
    updateEdited(true);
    const payLoad: TMainSettings = { ...formData };

    payLoad[key] = value;
    updateFormData(prev => {
      return {...formData,...payLoad}
    })

  }
   const addImage = async (f: {
     file: File, dataUrl:string,  settingsKey: "siteFaviconSVG" | "backgroundImages"
   }) => {
     const { file, dataUrl, settingsKey } = f;
     let id = `${file.name}_${Date.now()}`
     id = settingsKey == "siteFaviconSVG" ? imgAssetPrefix + "siteFaviconSVG": backgroundImageAssetPrefix+id;
     updateFilesToUpload(prev => {
       let newItems = [...prev];
       if (settingsKey == "siteFaviconSVG") {
         //Remove old one
         newItems = newItems.filter(u => u.id !== id);
       }
       return [...newItems,...[{id,file,uploaded:false}]]
     })
     if (settingsKey === "backgroundImages") {
       updateBackgroundImages(prev => {
         return [...prev, ...[{
           public_id: id,
           url:dataUrl
         }]]
       })
     }
     if (settingsKey === "siteFaviconSVG") {
       //updateFormValue(dataUrl,"siteFaviconSVG")
     }
   }
   const deleteImage = async (public_id: string) => {
     updateBackgroundImages(prev => prev.filter(b => b.public_id !== public_id));
     const toUpload = filesToUpload.find(f => f.id == public_id);
     if (toUpload) {
       updateFilesToUpload(prev => prev.filter(f => f.id !== public_id));
     } else {
       updateFilesToDelete(prev=>[...prev,...[{public_id,deleted:false}]])
     }
   }
   const submitContent = async (e: SyntheticEvent) => {
     e.preventDefault();

    e.preventDefault()
     let bgPayload = [...backgroundImages]

     const settingsPayload = { ...formData, ...{backgroundImages:bgPayload } }


    if (filesToUpload.length > 0 || filesToDelete.length > 0) {
       updateSaveState("uploading")
       for (const file of filesToUpload) {
         const params: UploadApiOptions = {
           public_id: file.id,
           overwrite: true
         }
         console.log(file.id)
         const { data, error } = await actions.media.generateSignature(params)
         if (error) {
           await alert(String(error), `Couldn't upload ${file.id}`)
           updateSaveState("idle")
           return false;
         }
         const uploadForm = new FormData();
         Object.keys(data).forEach(key => {
           const value = data[key];
           uploadForm.append(key, value);
         });
         uploadForm.append("file", file.file);
         try {
           const uploadResponse = await fetch(`https://api.cloudinary.com/v1_1/${data.cloud_name}/image/upload`, {
             method: 'POST',
             body: uploadForm,
           });
           const { url } = await uploadResponse.json();
           if (file.id.startsWith(backgroundImageAssetPrefix)) {
             let newBgImages = settingsPayload.backgroundImages.map(i => {
               if (i.public_id !== file.id) return i;
               return { ...i, ...{ url } }
             })
             settingsPayload.backgroundImages = newBgImages;
           }
           if (file.id.includes("siteFaviconSVG")) {
             console.log("updateFavicon")
             settingsPayload.siteFaviconSVG = url;
           }
           updateFilesToUpload(prev => {
             return prev.map(u => {
               if (u.id !== file.id) return u;
               return { ...u, uploaded: true }
             })
           })
         } catch (err) {
           throw new Error("Couldn't upload image: " + String(err))
         }
       }
       if (filesToDelete.length > 0) {
         const { data, error } = await actions.media.deleteMedia({ items: filesToDelete.map(d => d.public_id) })
         if (error) {
           await alert(String(error), "Couldn't delete");
           updateSaveState("idle")
           return false;
         }
       }


    }
     updateSaveState("saving");
     console.log(settingsPayload);

     const { data, error } = await actions.settings.updateMainSettings(settingsPayload);
     if (error) {
       await alert(String(error), "Couldn't save");
       updateSaveState("idle")
       return false;
     }
     removeSaveWarning();
     updateSaveState("idle")
     await alert("Settings saved");
     window.location.href = window.location.href;
     return;


  }


  return (

    <form onSubmit={submitContent} className="max-w-screen-lg">

    <FormContainer label="Site Name" formId={"siteTitle"}>
      <FormInput required={true}  value={formData.siteTitle} onChange={(value:string)=> {
        updateFormValue(value,"siteTitle")
      }} forValue="siteTitle"/>
    </FormContainer>
    <FormContainer label="Site Description" formId={"description"} helperText="This is the text that will appear on the homepage">
      <FormInput rows={5} value={formData.siteDescription} type="textarea" onChange={(value:string)=> {
        updateFormValue(value,"siteDescription")
      }} forValue="description"/>
    </FormContainer>
    <FormContainer label="Site Tagline" helperText="This is short line of text after the name in the nav bar of the browser" formId={"siteTagline"}>
      <FormInput required={false} value={formData.siteTagline} onChange={(value:string)=> {
        updateFormValue(value,"siteTagline")
      }} forValue="siteTagline"/>
    </FormContainer>

    <FormContainer label="Site Favicon (.svg)">
      <UploadImage accept={["image/svg+xml"]} uploadedImage={formData.siteFaviconSVG} formVal="siteFaviconSVG"
      fileCallback={(file:File,dataUrl:string) => {
        updateFormValue("", "siteFaviconSVG");
        addImage({
          file, dataUrl,

          settingsKey:"siteFaviconSVG"
        })

      }}

      />
      </FormContainer>

      <FormContainer label="Background Images" helperText="Images should be about 2000px wide and under 9mb" >
        <BackgroundImages {...{backgroundImages,addImage,deleteImage}} />
      </FormContainer>

      <FormContainer label="Social Links" formId="socialLinks" helperText="Enter entries in the format name,url;name,url;" >
        <FormInput forValue="socialLinks" pattern="([^,;]+,[^,;]+;?)+" value={formData.socialLinks} onChange={(value:string)=> {
          updateFormValue(value,"socialLinks")
        }}></FormInput>
      </FormContainer>

      {saveState == "uploading" && <UploadModal filesToDelete={filesToDelete.map(f => {
        return {id:f.public_id,deleted:f.deleted}
      })}
        filesToUpload={filesToUpload}
      />}


      <SaveFooter
        saveText="Update settings"
        beforeUnload={beforeunload}

        isPending={saveState=="saving"}
      ></SaveFooter>



</form>

  )
}

export default ({settingsData}:TProps) => {
  return <DialogProvider>
    <SettingsForm {...{settingsData}} />
  </DialogProvider>
}
/*


*/
