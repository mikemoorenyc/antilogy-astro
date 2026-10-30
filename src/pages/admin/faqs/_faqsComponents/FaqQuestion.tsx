import { useState } from "react";
import type { Faq } from "@/pages/api/faqs/_types";
import ReactButton from "../../../../components/Button/ReactButton";
import FormContainer from "../../_adminComponents/formelements/FormContainer";
import FormInput from "../../_adminComponents/formelements/FormInput";
import RTEditor from "../../_adminComponents/formelements/RTEditor";
import type { ButtonModifiers } from "@/components/Button/types";
import {useSortable} from '@dnd-kit/react/sortable';
type TProps = {
  deleteQuestion:(id:number,sectionId:number) =>void
  question: Faq,
  updateQuestionEditing: React.Dispatch<React.SetStateAction<boolean>>,
  updater: (id: number,sectionId:number, payload: { question: string, answer: string }) => void
  sectionId: number,
  index:number
}

export default function FaqQuestion({ deleteQuestion, question, updater, updateQuestionEditing,sectionId,index }: TProps) {

  const title = question.question;
  const { answer } = question
  const [tempAnswer, updateTempAnswer] = useState(answer);
  const [tempTitle, updateTempTitle] = useState(title);
  const [isEditing, updateIsEditing] = useState(false);

  const btnClasses: ButtonModifiers[] = ["sm", "ghost"];
  const saveClasses: ButtonModifiers[] = ["reverse", "sm"]
  if (!tempTitle) {
    saveClasses.push("disabled");
  }

  const {ref, isDragging,handleRef} = useSortable({
    id:question.id,
    index,
    type: 'question',
    accept: 'question',
    group: sectionId
  });


  return (
    <div ref={ref} className={`border border-foreground  ml-5 bg-background [&:not(:first-child)]:mt-2 ${isDragging?"border-solid":"border-dotted"}`} >


      <div className="flex p-1 ">
        <div  className="pt-1 cursor-grab p-1" ref={handleRef}>
                  <span className="icon-[carbon--draggable] size-4"></span>
                </div>
        <div className="flex-1">

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
                  <ReactButton onClick={()=>{updateIsEditing(true);updateQuestionEditing(true)}} modClasses={btnClasses} label="Edit" icon={<span className="w-4 h-4 icon-[carbon--edit]" />} />
                  <ReactButton onClick={()=>{deleteQuestion(question.id,sectionId)}} modClasses={[...btnClasses,...["caution" as ButtonModifiers]]} label="Delete" icon={<span className="icon-[carbon--trash-can] w-4 h-4 " />} />
                </>}
                {isEditing && <>
                  <ReactButton label="Save" icon={<span className="icon-[carbon--checkmark]" />} modClasses={saveClasses}
                    onClick={()=> {
                      updateIsEditing(false);
                      updateQuestionEditing(false)
                      updater(question.id, sectionId,{
                        question: tempTitle,
                        answer: tempAnswer
                      })
                    }}

                  />
                  <ReactButton label="Cancel" icon={<span className="icon-[carbon--close]" />} modClasses={["sm","ghost"]}
                    onClick={()=> {
                      updateIsEditing(false);
                      updateTempTitle(title);
                      updateTempAnswer(question.answer);
                    }}


                  />


                </>}

              </div>


        </div>
      </div>

    </div>

  )
}
