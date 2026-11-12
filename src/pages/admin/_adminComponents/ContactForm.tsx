import { useState ,useEffect,useMemo, type SyntheticEvent} from "react";
import type { Contact,ContactFormSection } from "@/pages/api/contact/_types";
import FormContainer from "./formelements/FormContainer";
import FormInput from "./formelements/FormInput";
import RTEditor from "./formelements/RTEditor";
import FormEditor from "./FormEditor";
import SaveFooter from "./formelements/SaveFooter";
import type { TContactSettings } from "@/actions/settings/schema";
import { actions } from "astro:actions";
import useSaveWarning from "./_hooks/useSaveWarning";
import { DialogProvider,useDialog } from "@/components/Dialog/Dialog";

function ContactForm({ contactSettings }: { contactSettings: TContactSettings }) {

  const [formData,updateFormData] = useState({...contactSettings});
  const [edited,updateEdited] = useState(false);
  const [isPending,updateIsPending] = useState(false)

  const currentValue = useMemo(() => JSON.stringify(formData),[formData])
  const { removeSaveWarning, beforeunload } = useSaveWarning(JSON.stringify(contactSettings), currentValue);
  const { confirm, alert } = useDialog();
  const valueChange = (key:string, value: any) => {
    updateEdited(true)
    const payLoad :TContactSettings = {...formData};
    payLoad[key as keyof TContactSettings] = value;
    updateFormData(prev => {
      return {...prev,...payLoad}
    })

  }
  const submitForm = async (e:SyntheticEvent) => {

    e.preventDefault();
    updateIsPending(true);

    const { data, error } = await actions.settings.updateContactSettings(formData)

    if (error) {
      await alert("Couldn't update: " + String(error));
      return
    }
    removeSaveWarning();
    updateIsPending(false);
    await alert("Settings updated");
    window.location.href = window.location.href;

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
    <FormContainer formId="hours" label={"Shop Hours"}>
      <RTEditor
        content={formData.hours || ""}
        updateCallback={(value:string)=> {
          valueChange("hours",value);
        }}
      />

  </FormContainer>
  <FormContainer formId="email" label={"Email Address"}>
    <FormInput forValue="email" type="email" value={formData.email} onChange={(value:string)=> {
      valueChange("email",value)
    }} />
  </FormContainer>

  <SaveFooter
    saveText="Update Contact page"
    {...{isPending,beforeUnload:beforeunload}}
  />
  </form>
}

export default function ({contactSettings}:{contactSettings:TContactSettings}) {

  return <DialogProvider>
    <ContactForm {...{contactSettings}} />
  </DialogProvider>
}
