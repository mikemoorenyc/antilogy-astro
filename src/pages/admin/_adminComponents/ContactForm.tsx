import { useState ,useEffect, type SyntheticEvent} from "react";
import type { TContact } from "../../../../types"
import FormContainer from "./formelements/FormContainer";
import FormInput from "./formelements/FormInput";
import ReactButton from "../../../components/ReactButton";
import RTEditor from "./formelements/RTEditor";
import FormEditor, { type TContactFormSection } from "./FormEditor";
export default function ContactForm({contactSettings}:{contactSettings:TContact}) {
  
  const [formData,updateFormData] = useState({...contactSettings});
  const [edited,updateEdited] = useState(false);
  
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
    const payLoad :TContact  = {...formData};
    payLoad[key as keyof TContact] = value;  
    updateFormData(prev => {
      return {...prev,...payLoad}
    })

  }
  const submitForm = async (e:SyntheticEvent) => {
    
    e.preventDefault(); 

    const sendUpdatedSettings = await fetch("/api/dynamodb/settings",{
      method:"POST",
      body: JSON.stringify(formData)
    })
    if(sendUpdatedSettings) {
      alert("Settings updated");
      location.reload();
      return false; 
    }
  }
  return <form onSubmit={submitForm} className="max-w-screen-lg">
  <FormContainer label="Contact Form">
    <FormEditor data={formData.contactForm} updateCallback={(value:TContactFormSection[]) => {
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
  
  
  <ReactButton label="Update Contact Page" type="action" classes="mb-3 md:mb-0 md:mr-3"  modClasses={["big","reverse"]}/>
  </form>
}