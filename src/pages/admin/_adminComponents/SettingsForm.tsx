import FormContainer from "./formelements/FormContainer"
import { useState,useEffect, type SyntheticEvent } from "react"
import ReactButton from "../../../components/Button/ReactButton"
import FormInput from "./formelements/FormInput"
import type { Settings,SpotifyData } from "@/pages/api/settings/_types"
import { createPortal } from "react-dom"
import UploadImage from "./formelements/UploadImage"

import { uploader } from "../../../_lib/uploader"
import SpotifySection from "./formelements/SpotifySection"
import SaveFooter from "./formelements/SaveFooter"

type TProps = {
  settingsData: Settings,
  spotifyData?: SpotifyData
}
type TUploadItem = {
  file: File,
  settingsKey: string
}

export default function SettingsForm({settingsData,spotifyData}:TProps) {

  const [formData,updateFormData] = useState(settingsData);
  const [edited, updateEdited] = useState(false);
  const [settingsSent, updateSettingsSent] = useState(false);
  const [isPending, updateIsPending] = useState(false)
  const [itemsToUpload,updateItemsToUpload] = useState<TUploadItem[]>([])
  const [modalContainer,updateModalContainer] = useState<HTMLElement|null>(null);
  const [errors,updateErrors] = useState<[string,boolean][]>([])
  const [filesToUpload,updateFilesToUpload] = useState<{id:string,file:File}[]>([])
  
  

  const beforeUnload = (e:BeforeUnloadEvent) => {
    e.preventDefault();
  }
  useEffect(()=> {
    if(!window) return ; 
    updateModalContainer(document.getElementById("modal-container"));
  },[])

  useEffect(()=> {
    if(!edited ||import.meta.env.DEV) return ; 
    

  window.addEventListener('beforeunload', beforeUnload);
    return ()=> {
      window.removeEventListener('beforeunload', beforeUnload);
    }
  },[edited])


  const updateFormValue = (value:string,key:string) => {
    updateEdited(true);
    const payLoad :Settings  = {...formData};
    payLoad[key as keyof Settings] = value;  
    updateFormData(prev => {
      return {...formData,...payLoad}
    })

  }
  const submitContent = async (e:SyntheticEvent) => {
    e.preventDefault()
    updateIsPending(true);
    const settingsPayload = {...formData}

    console.log(settingsPayload,filesToUpload);
    
    for (const file of filesToUpload) {
      //DELETE OLD FILE
      if(settingsData[file.id as keyof Settings]) {
        let deletePath = settingsData[file.id as keyof Settings]?.split("/settings_files/")[1];
        deletePath = "settings_files/"+deletePath
        const deleteOld = await fetch("/api/GC/",{
          method:"DELETE",
          body:JSON.stringify({path:deletePath})
          
        });
        if(!deleteOld) {
          alert("Couldn't delete old one");
        }
      }
      const upload = await uploader(file.file,`settings_files/${file.id}-${Date.now()}.${file.file.name.split(".")[1]}`);
      if(!upload) {
        console.log("couldn't upload",file);
        return false; 
      }
      settingsPayload[file.id as keyof Settings] = upload
    }

    console.log(settingsPayload);
  

    const sendUpdatedSettings = await fetch("/api/settings",{
      method:"POST",
      body: JSON.stringify(settingsPayload)
    })
    if(sendUpdatedSettings) {
      alert("Settings updated");
      location.reload();
      return false; 
    }
  }
  
  return (
<form onSubmit={submitContent} className="max-w-screen-lg">
    <FormContainer label="Site Name" formId={"siteTitle"}>
      <FormInput  value={formData.siteTitle} onChange={(value:string)=> {
        updateFormValue(value,"siteTitle")
      }} forValue="siteTitle"/>
    </FormContainer>
    <FormContainer label="Site Description" formId={"description"} helperText="This is the text that will appear on the homepage">
      <FormInput rows={5} value={formData.siteDescription} type="textarea" onChange={(value:string)=> {
        updateFormValue(value,"siteDescription")
      }} forValue="description"/>
    </FormContainer>
    <FormContainer label="Site Background">
      <UploadImage accept={["image/png", "image/jpeg,image/webp"]} uploadedImage={formData.siteBg} formVal="siteBg"
      fileCallback={(f:File) => {
        updateFormValue("","siteBg");
        updateFilesToUpload(p => {
          return [...[{id:"siteBg",file:f}],...p]
        })
      }}
      
      />
    </FormContainer>
    <FormContainer label="Site Favicon (.ico)">
      <UploadImage accept={["image/x-icon"]} uploadedImage={formData.siteFavicon} formVal="siteFavicon"
      fileCallback={(f:File) => {
        updateFormValue("","siteFavicon");
        updateFilesToUpload(p => {
          return [...[{id:"siteFavicon",file:f}],...p]
        })
      }}
      
      />
    </FormContainer>
    <FormContainer label="Site Favicon (.svg)">
      <UploadImage accept={["image/svg+xml"]} uploadedImage={formData.siteFaviconSVG} formVal="siteFaviconSVG"
      fileCallback={(f:File) => {
        updateFormValue("","siteFaviconSVG");
        updateFilesToUpload(p => {
          return [...[{id:"siteFaviconSVG",file:f}],...p]
        })
      }}
      
      />
    </FormContainer>
    <FormContainer label="Homepage Logo">
      <UploadImage 
      accept={["image/png", "image/jpeg"]}
      fileCallback={(f:File)=> {
        updateFormValue("","homepageLogo");
        updateFilesToUpload(p => {
          return [...[{id:"homepageLogo",file:f}],...p]
        })
      }}
      errorCallback={(tf:boolean)=> {
        updateErrors(prev => {
          const old = prev.filter((file) => file[0] !== "homepageLogo");

         old.push(["homepageLogo",tf])
         return old; 

        })
      }}
      formVal="homepageLogo"
      uploadedImage={formData.homepageLogo}
      requirements={{
        maxWidth:[1000,"Maximum width is 1000px"]
      }}
      />
    
    </FormContainer>
    <FormContainer label="Spotify Integration">
      <SpotifySection spotifyData={spotifyData}/>
    
    </FormContainer>

    <SaveFooter
      saveText="Update Settings"
      {...{isPending,beforeUnload}}
    
     />


    
</form>

  )
}


/*
const sig = await fetch(`/api/media/signature?public_id=${file.id}&folder=${`settings_images`}`);
      if(!sig.ok) {
        alert("Couldn't get cloudinary signature signature "+file.id);
        console.log(sig.status);
        return false; 
      }
      const formData = new FormData();
      const sigValues = await sig.json()
      Object.keys(sigValues).forEach(key => {
        const value = sigValues[key];
         formData.append(key, value);
      }); 
      formData.append("file",file);
      const uploadResponse = await fetch(`https://api.cloudinary.com/v1_1/${sigValues.cloudName}/image/upload`, {
        method: 'POST',
        body: formData,
      });
      if(!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        alert(`Couldn't upload ${file.id} ${errorData.error.message}`)
      }
      const uploadResult = await uploadResponse.json();

*/
