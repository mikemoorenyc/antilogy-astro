import { useState } from "react";
import type { Faq } from "@/pages/api/faqs/_types";
import { CheckIcon, PencilIcon, TrashIcon, XMarkIcon } from "@heroicons/react/16/solid"
import ReactButton from "../../../../components/Button/ReactButton";
import FormContainer from "../../_adminComponents/formelements/FormContainer";
import FormInput from "../../_adminComponents/formelements/FormInput";
import RTEditor from "../../_adminComponents/formelements/RTEditor";
import type { ButtonModifiers } from "@/components/Button/types";
type TProps = {
  question: Faq,
  updateQuestionEditing: React.Dispatch<React.SetStateAction<boolean>>,
  updater : (id:number,payload:{question:string,answer:string}) => void
}

export default function FaqQuestion ({question,updater,updateQuestionEditing}:TProps) {

  const title = question.question;
  const {answer} = question
  const [tempAnswer,updateTempAnswer] = useState(answer);
  const [tempTitle,updateTempTitle] = useState(title);
  const [isEditing,updateIsEditing] = useState(false);
  
  const btnClasses :ButtonModifiers[] = ["sm","ghost"];
  const saveClasses : ButtonModifiers[] = ["reverse","sm"]
  if(!tempTitle) {
    saveClasses.push("disabled");
  }

  
  return (
  <div>
    
      {!isEditing && <>
        <div className="flex-1">{tempTitle}</div>
        {tempAnswer && <div className="text-sm pt-2" dangerouslySetInnerHTML={{__html:tempAnswer}}></div>}
        
      </>}
      {isEditing && <div className="p-2">
        <FormContainer label={"Question"} formId="question">
          <FormInput value={tempTitle} forValue="question" onChange={(value)=>{updateTempTitle(value)}} />
          {!tempTitle&&<div className="text-caution text-xs" >This is required</div>}
        </FormContainer>
        <FormContainer label="Answer" formId="answer">
          <RTEditor content={tempAnswer} updateCallback={(v)=>{updateTempAnswer(v)}} />
        
        </FormContainer>
      
      </div>}

      <div id="controls" className="pt-4 flex-center">
          {!isEditing && <>
            <ReactButton onClick={()=>{updateIsEditing(true);updateQuestionEditing(true)}} modClasses={btnClasses} label="Edit" icon={<PencilIcon className="w-4 h-4" />} />
            <ReactButton modClasses={[...btnClasses,...["caution" as ButtonModifiers]]} label="Delete" icon={<TrashIcon className="w-4 h-4 " />} />
          </>}
          {isEditing && <>
            <ReactButton label="Save" icon={<CheckIcon />} modClasses={saveClasses}
              onClick={()=> {
                updateIsEditing(false);
                updateQuestionEditing(false)
                updater(question.id, {
                  question:tempTitle,
                  answer: tempAnswer
                })
              }}
            
            />
            <ReactButton label="Cancel" icon={<XMarkIcon />} modClasses={["sm","ghost"]}
              onClick={()=> {
                updateIsEditing(false);
                updateTempTitle(title);
                updateTempAnswer(question.answer);
              }}
            
            
            />
          
          
          </>}
        
        </div>
      
    
  </div>
  )
}