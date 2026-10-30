import React, {  useState, type SyntheticEvent,useRef, useMemo,  } from "react";
import type {  Faq } from "@/pages/api/faqs/_types";
import { DragDropProvider,} from "@dnd-kit/react";
import {  isSortable } from "@dnd-kit/react/sortable";
import { move } from "@dnd-kit/helpers";
import ReactButton from "../../../../components/Button/ReactButton";

import { type TFAQ, type TFAQSection } from "@/actions/settings/schema";
import { actions } from 'astro:actions';
import FaqQuestion from "./FaqQuestion";
import SaveFooter from "../../_adminComponents/formelements/SaveFooter";
import { type TFAQSettings } from "@/actions/settings/schema";
import FormContainer from "../../_adminComponents/formelements/FormContainer";
import FormInput from "../../_adminComponents/formelements/FormInput";
import RTEditor from "../../_adminComponents/formelements/RTEditor";
import useSaveWarning from "../../_adminComponents/_hooks/useSaveWarning";
import FaqSection from "./FaqSection";

const sectionDndId = (id: number) => `section-${id}`;
const questionDndId = (id: number) => `question-${id}`;
const emptySectionDndId = (id: number) => `empty-section-${id}`;

const formatter = (faqs: TFAQSection[]) => {
  const flattened: {
    [id:number]: Faq[]
  } = {}
  faqs.forEach(i => {
    flattened[i.id] = i.questions
  })

  return flattened;
}

export default function FaqForm({ faqData }: { faqData: TFAQSettings }) {
  const [items, setItems] = useState<TFAQSection[]>(faqData.faqSection);
  const [isPending, updateIsPending] = useState(false);
  const [questionEditing, updateQuestionEditing] = useState<boolean>(false)
  const [pageTitle, updatePageTitle] = useState(faqData.pageTitle);
  const [pageIntro, updatePageIntro] = useState<string>(faqData.pageIntro || "")
  const currentValues = useMemo(()=>JSON.stringify({
    pageTitle,pageIntro, faqSection:items
  }), [items,pageIntro,pageTitle])
  const { removeSaveWarning, beforeunload } = useSaveWarning(
    JSON.stringify({
      pageTitle: faqData.pageTitle,
      pageIntro: faqData.pageIntro||"",
      faqSection: faqData.faqSection
    }),
    currentValues
  )
  const [questions, setQuestions] = useState<Record<number, Faq[]>>(
    () => Object.fromEntries(
      faqData.faqSection.map(section => [section.id, section.questions])
    )
  );


  const deleteFaqSection = (item:TFAQSection) => {
    setItems((prev) => {
      return prev.filter(i => i.id !== item.id)
    })
  }
  const changeSectionTitle = (id:number,newTitle:string) => {
      setItems(prev => {
        return prev.map(section => {
          if(id === section.id) {
            return {...section, ...{title:newTitle}}
          }
          return section;
        })
      })
  }
  const updateQuestion = (id:number,sectionId:number,payload:{question:string,answer:string}) => {
    setQuestions(prev => {
      const currentBlock = prev[sectionId];
      if (!currentBlock) {
        alert("couldn't find section")
        return prev;
      }
      const newBlock = currentBlock.map(q => {
        if (q.id !== id) return  q;
        return { ...q,...payload }
      })
      return {...prev, [sectionId]:newBlock}


    })
  }
  const addQuestion = (sectionId: number) => {
    setQuestions(prev => {
      const currentBlock = [...(prev[sectionId] ?? []), ...[{
        id:Date.now(),
        question: "New Question",
        answer: ""
      }]];
      return { ...prev, [sectionId]:currentBlock };

    })

  }
  function deleteQuestion(id: number,sectionId:number): void {
    console.log(id);
    if (!confirm("Are you ok with deleting this?")) {
      return;
    }
    setQuestions(prev => {
      const currentBlock = prev[sectionId];
      if (!currentBlock) {
        alert("Couldn't find section")
        return prev;
      }
      return {...prev, [sectionId]:currentBlock.filter(q=>q.id!==id)}
    })

  }

  const submitForm = async (e:SyntheticEvent) => {
    e.preventDefault();
    updateIsPending(true);

    const {data,error}= await actions.settings.updateFaqSettings({
      pageIntro,
      pageTitle,
      faqSection: itemsFormatted,
      section:"faqs"
    })
    if (error) {
      alert("couldn't update Faqs");
      console.log(error);
    } else {
      removeSaveWarning();
      updateIsPending(false);
      alert("Updated Faqs")
      window.location.href = window.location.href;
    }
    updateIsPending(false);
    return false;


  }
  const snapshot = useRef(structuredClone({ items, questions }));
  const itemsFormatted = useMemo(() => {
    return items.map(s => {
      return {...s,questions:questions[s.id]||[]}
    })
  },[items,questions])
  const findQuestion = (id: number) => {
    let question
    const section = items.find(s => {
      let questionsFlat = s.questions.map(q => q.id);
      return questionsFlat.includes(id);
    })
    if (!section) {
      throw new Error("Couldn't find section")
    }
    question = section.questions.find(q => q.id === id);
    if (!question) {
      throw new Error("Couldn't find question")
    }
    return {question,section}
  }

  return <form onSubmit={submitForm} className="max-w-screen-lg">
    <div className="border border-foreground p-4 mb-4">

      <DragDropProvider
        onDragEnd={
          (event) => {
              const { source ,target} = event.operation;

              if (event.canceled) {
                setItems(snapshot.current.items);
                setQuestions(snapshot.current.questions);
                return;
              }
            if (target?.type == "empty-section") {
              if (!isSortable(source)) return;
              const { group } = source;
              if (!group) {
               throw new Error("No group ID")
              }
              const sourceId = Number(source.group);
              const targetId = Number(String(target.id).replace("empty-", ""));
              if (Number.isNaN(sourceId) || Number.isNaN(targetId)) {
                  throw new Error("Invalid section ID");
              }
              setQuestions(prev => {
                const oldList = [...(prev[sourceId] ?? [])];
                const question = oldList.find(q => q.id == source.id);
                if (!question) return prev;
                return {
                      ...prev,
                      [sourceId]: oldList.filter(q => q.id !== question.id),
                      [targetId]: [question]
                    };
              })

              return;

            }

              if (source?.type === "section") {
                setItems(current => move(current, event));
              }
            }
        }
        onDragOver={(event) => {
            const { source } = event.operation;

            if (source?.type === "section") return;

            setQuestions(current => move(current, event));
          }}
        onDragStart={() => {
          snapshot.current = {
            items: structuredClone(items),
            questions: structuredClone(questions)
          };
        }}

      >
        {items.map((section,index)=> {
          return <FaqSection key={section.id}
            section={{...section, questions:questions[section.id]??[]}}
            {...{index,changeSectionTitle,deleteFaqSection,questionEditing,addQuestion}}
          >
            {(questions[section.id]??[]).map((question,index) => {
              return <FaqQuestion
                key={question.id}
                sectionId={section.id}
                {...{question,index,deleteQuestion,updateQuestionEditing,updater:updateQuestion}}
              />
            })}
          </FaqSection>
        })}
      </DragDropProvider>

  </div>
    <div className="mb-8">
      <ReactButton modClasses={[] }  label="Add a FAQ section" onClick={
        () => {
          setItems(prev => {
          return [...prev, ...[{
            title: "New Section",
            id: Date.now(),
            questions:[]
          }]]
        })
        }
      } />
    </div>
    <div>{JSON.stringify(itemsFormatted) }</div>
    <FormContainer formId="pageTitle" label="Page title">
      <FormInput forValue="pageTitle" type="text" required={true} value={pageTitle} onChange={updatePageTitle}/>
    </FormContainer>
    <FormContainer formId="pageIntro" label="Page intro">
      <RTEditor content={pageIntro} updateCallback={updatePageIntro} />

    </FormContainer>

  <SaveFooter
    {...{isPending,beforeUnload:beforeunload}}
    saveText="Save FAQs"
  />

  </form>
}
