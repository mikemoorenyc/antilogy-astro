import { useState ,useEffect, type SyntheticEvent} from "react";
import type { Contact,ContactFormSection } from "@/pages/api/contact/types";
import FormContainer from "./formelements/FormContainer";
import FormInput from "./formelements/FormInput";
import RTEditor from "./formelements/RTEditor";
import FormEditor from "./FormEditor";
import SaveFooter from "./formelements/SaveFooter";
export default function ContactForm({contactSettings}:{contactSettings:Contact}) {
  
  const [formData,updateFormData] = useState({...contactSettings});
  const [edited,updateEdited] = useState(false);
  const [isPending,updateIsPending] = useState(false)
  
  const beforeUnload = (e:BeforeUnloadEvent) => {
    e.preventDefault();
  }
  useEffect(()=> {
      if(!edited ||import.meta.env.DEV) return ; 
      
  
    window.addEventListener('beforeunload', beforeUnload);
      return ()=> {
        window.removeEventListener('beforeunload', beforeUnload);
      }
  },[edited])
  const valueChange = (key:string, value: any) => {
    updateEdited(true)
    const payLoad :Contact  = {...formData};
    payLoad[key as keyof Contact] = value;  
    updateFormData(prev => {
      return {...prev,...payLoad}
    })

  }
  const submitForm = async (e:SyntheticEvent) => {
    
    e.preventDefault(); 
    updateIsPending(true);

    const sendUpdatedSettings = await fetch("/api/dynamodb/settings",{
      method:"POST",
      body: JSON.stringify(formData)
    })
    updateIsPending(false); 
    if(sendUpdatedSettings) {
      alert("Settings updated");
      location.reload();
      return false; 
    }
  }
  return <form onSubmit={submitForm} className="max-w-screen-lg">
  <FormContainer label="Contact Form">
    <FormEditor data={formData.contactForm} updateCallback={(value:ContactFormSection[]) => {
      valueChange("contactForm",value);
    }}/>
  </FormContainer>
  <FormContainer formId="pageTitle" label="Page Title">
    <FormInput forValue={"pageTitle"} value={formData.pageTitle} onChange={(value:string) => {
      valueChange("pageTitle",value);
    }}/>
  </FormContainer>
  <FormContainer label={"Page intro"}>
    <RTEditor options={["bold","italic","addLink","removeLink"]} content={formData.pageIntro||""} updateCallback={(value:string) => {
      valueChange("pageIntro",value);
    }} />
  </FormContainer>
  <FormContainer label={"Physical Address"}>
    <RTEditor
      options={["addLink","removeLink"]}
      content={formData.physicalAddress||""}
      updateCallback={(value:string)=> {
        valueChange("physicalAddress",value);
      }}
     />
  </FormContainer >
  <FormContainer formId="hours"label={"Shop Hours"}>
    <FormInput forValue="hours" type="textarea" value={formData.hours} onChange={(value:string)=> {
      valueChange("hours",value)
    }} />
  </FormContainer>
  <FormContainer formId="email" label={"Email Address"}>
    <FormInput forValue="email" type="email" value={formData.email} onChange={(value:string)=> {
      valueChange("email",value)
    }} />
  </FormContainer>
  
  <SaveFooter 
    saveText="Update Contact page"
    {...{isPending,beforeUnload}}
  />
  </form>
}