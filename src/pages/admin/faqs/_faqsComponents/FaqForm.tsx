import React, { useEffect, useState, type SyntheticEvent,useRef, useMemo, } from "react";
import type { FaqSection } from "@/pages/api/faqs/_types";
import { DragDropProvider, useDroppable } from "@dnd-kit/react";
import { useSortable, isSortable } from "@dnd-kit/react/sortable";
import { CollisionPriority } from "@dnd-kit/abstract";
import ReactButton from "../../../../components/Button/ReactButton";
import FaqSectionHeader from "./FaqSectionHeader";

import { actions } from 'astro:actions';
import FaqQuestion from "./FaqQuestion";
import SaveFooter from "../../_adminComponents/formelements/SaveFooter";
import { type TFAQSettings } from "@/actions/settings/schema";
import FormContainer from "../../_adminComponents/formelements/FormContainer";
import FormInput from "../../_adminComponents/formelements/FormInput";
import RTEditor from "../../_adminComponents/formelements/RTEditor";
import useSaveWarning from "../../_adminComponents/_hooks/useSaveWarning";

const sectionDndId = (id: number) => `section-${id}`;
const questionDndId = (id: number) => `question-${id}`;
const emptySectionDndId = (id: number) => `empty-section-${id}`;

type SortableQuestionProps = {
  question: FaqSection["questions"][number];
  index: number;
  sectionId: number;
  deleteQuestion:(id:number)=>void,
  updateQuestion: (
    id: number,
    payload: { question: string; answer: string }
  ) => void;
  updateQuestionEditing: React.Dispatch<React.SetStateAction<boolean>>
};
function SortableFaqQuestion({
  question,
  index,
  sectionId,
  updateQuestion,
  updateQuestionEditing,
  deleteQuestion
}: SortableQuestionProps) {
  const { ref, handleRef, isDragging } = useSortable({
    id: questionDndId(question.id),
    index,
    group: sectionDndId(sectionId),
    type: "question",
    accept: "question",
  });

  return (
    <div
      ref={ref}
      className={`border border-foreground border-dotted ml-5 bg-background [&:not(:first-child)]:mt-2 ${isDragging ? "opacity-50" : ""}`}
    >
      <div className="flex p-1">
        <div ref={handleRef} className="pt-1 cursor-grab">
          <span className="icon-[carbon--draggable] size-4"></span>
        </div>

        <div className="flex-1">
          <FaqQuestion
            deleteQuestion={deleteQuestion}
            updateQuestionEditing={updateQuestionEditing}
            updater={updateQuestion}
            question={question}
          />
        </div>
      </div>
    </div>
  );
}
type SortableSectionProps = {
  section: FaqSection;
  index: number;
  questionEditing: boolean;
  changeSectionTitle: (id: number, newTitle: string) => void;
  deleteFaqSection: (section: FaqSection) => void;
  updateQuestion: (
    id: number,
    payload: { question: string; answer: string }
  ) => void;
  updateQuestionEditing: React.Dispatch<React.SetStateAction<boolean>>
  addQuestion: (sectionId: number) => void;
  deleteQuestion:(id:number)=>void
};
function SortableFaqSection({
  section,
  index,
  questionEditing,
  changeSectionTitle,
  deleteFaqSection,
  updateQuestion,
  updateQuestionEditing,
  addQuestion,
  deleteQuestion
}: SortableSectionProps) {
  const { ref, handleRef, isDragging } = useSortable({
    id: sectionDndId(section.id),
    index,
    type: "section",
    accept: "section",
  });

  const {
    ref: emptyDropRef,
    isDropTarget,
  } = useDroppable({
    id: emptySectionDndId(section.id),
    type: "empty-section",
    accept: "question",
    collisionPriority: CollisionPriority.Low,
  });

  return (
    <div
      ref={ref}
      className={`bg-shadow-sm border border-foreground mb-4 p-2 bg-background ${
        isDragging ? "border" : "border-dashed"
      }`}
    >
      <div className="flex-center mb-2">
        <div ref={handleRef} className="cursor-grab">
          <span className="icon-[carbon--draggable] size-5"></span>
        </div>

        <FaqSectionHeader
          questionEditing={questionEditing}
          changeSectionTitle={(newTitle: string) =>
            changeSectionTitle(section.id, newTitle)
          }
          section={section}
          deleteItem={() => deleteFaqSection(section)}
        />
      </div>

      <div>
        {section.questions.length === 0 ? (
          <div
            ref={emptyDropRef}
            style={{ height: 32 }}
            className={`border border-foreground border-dotted ml-5 ${
              isDropTarget ? "bg-gray-200/30" : ""
            }`}
          />
        ) : (
          section.questions.map((question, questionIndex) => (
            <SortableFaqQuestion
              key={question.id}
              deleteQuestion={deleteQuestion}
              question={question}
              index={questionIndex}
              sectionId={section.id}
              updateQuestion={updateQuestion}
              updateQuestionEditing={updateQuestionEditing}
            />
          ))
        )}
      </div>

      <div className="pl-5 py-3">
        <ReactButton
          modClasses={["sm"]}
          label="Add FAQ"
          onClick={() => addQuestion(section.id)}
        />
      </div>
    </div>
  );
}


export default function FaqForm({ faqData }: { faqData: TFAQSettings }) {
  const [items, setItems] = useState<FaqSection[]>(faqData.faqSection);
  const [formUpdated, updateFormUpdated] = useState(false);
  const [isPending, updateIsPending] = useState(false);
  const [questionEditing, updateQuestionEditing] = useState<boolean>(false)
  const [pageTitle, updatePageTitle] = useState(faqData.pageTitle);
  const [pageIntro, updatePageIntro] = useState<string>(faqData.pageIntro || "")
  const dragSnapshot = useRef<FaqSection[]>([]);
  const currentQuestionSection = useRef<string | null>(null);
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



  const cloneSections = (sections: FaqSection[]) =>
    sections.map((section) => ({
      ...section,
      questions: [...section.questions],
    }));

  const handleDragStart = () => {
    dragSnapshot.current = cloneSections(items);
    currentQuestionSection.current = null;
  };
  const handleDragOver = (
    event: Parameters<
      NonNullable<
        React.ComponentProps<typeof DragDropProvider>["onDragOver"]
      >
    >[0]
  ) => {
    const { source, target } = event.operation;

    if (!isSortable(source) || source.type !== "question") return;

    const questionId = Number(
      String(source.id).replace(/^question-/, "")
    );

    const fromGroup = currentQuestionSection.current ??
      (typeof source.group === "string" ? source.group : null);

    let toGroup = source.group;
    let destinationIndex = source.index;

    if (
      typeof target?.id === "string" &&
      target.id.startsWith("empty-section-")
    ) {
      toGroup = sectionDndId(
        Number(target.id.replace(/^empty-section-/, ""))
      );
      destinationIndex = 0;
    } else if (target && isSortable(target) && target.type === "question") {
      toGroup = target.group;
      destinationIndex = target.index;
    }

    if (
      typeof fromGroup !== "string" ||
      typeof toGroup !== "string" ||
      fromGroup === toGroup
    ) {
      return;
    }

    // React will manage this cross-section move, not dnd-kit's
    // optimistic DOM sorting.
    event.preventDefault();

    const fromId = Number(fromGroup.replace(/^section-/, ""));
    const toId = Number(toGroup.replace(/^section-/, ""));

    setItems((previous) => {
      const next = cloneSections(previous);

      const from = next.find((section) => section.id === fromId);
      const to = next.find((section) => section.id === toId);

      if (!from || !to) return previous;

      const fromIndex = from.questions.findIndex(
        (question) => question.id === questionId
      );

      if (fromIndex < 0) return previous;

      const [question] = from.questions.splice(fromIndex, 1);
      if (!question) return previous;

      const insertAt = Math.max(
        0,
        Math.min(destinationIndex, to.questions.length)
      );

      to.questions.splice(insertAt, 0, question);

      return next;
    });

    currentQuestionSection.current = toGroup;
  };

  const handleDragEnd = (
    event: Parameters<
      NonNullable<
        React.ComponentProps<typeof DragDropProvider>["onDragEnd"]
      >
    >[0]
  ) => {
    const { source } = event.operation;

    if (event.canceled) {
      setItems(cloneSections(dragSnapshot.current));
      currentQuestionSection.current = null;
      return;
    }

    if (!isSortable(source)) {
      currentQuestionSection.current = null;
      return;
    }

    // Reorder FAQ sections.
    if (source.type === "section") {
      if (source.initialIndex !== source.index) {
        setItems((previous) => {
          const next = [...previous];
          const [section] = next.splice(source.initialIndex, 1);

          if (!section) return previous;

          next.splice(source.index, 0, section);
          return next;
        });
      }

      currentQuestionSection.current = null;
      return;
    }

    // Question moves and reordering are handled during drag-over.
    // Don't apply them a second time here.
    if (source.type === "question") {
      currentQuestionSection.current = null;
    }
  };


  const deleteFaqSection = (item:FaqSection) => {
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
  const updateQuestion = (id:number,payload:{question:string,answer:string}) => {
    setItems(prev => {
       return prev.map(s => {
        const item = s.questions.find(q=>q.id == id);
        if(!item) return s;
        const newQuestions = s.questions.map(q => {
          if(q.id !== id) return q;
          return {...q, ...payload}

        })
        return {...s,...{questions:newQuestions}}
       })
    })
  }
  function deleteQuestion(id: number): void {
    console.log(id);
    if (!confirm("Are you ok with deleting this?")) {
      return;
    }
    setItems(prev => {
      return prev.map(s => {
        const item = s.questions.find(q => q.id == id)
        console.log(item);
        if (!item) return s;
        const questions = s.questions.filter(q => q.id !== id);

        return {...s,...{questions}}
      })
    })
  }

  const submitForm = async (e:SyntheticEvent) => {
    e.preventDefault();
    updateIsPending(true);

    const {data,error}= await actions.settings.updateFaqSettings({
      pageIntro,
      pageTitle,
      faqSection: items,
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

    /*
    const sendUpdatedFaqs = await fetch("/api/faqs",{
      method:"POST",
      body: JSON.stringify({faqs:items})
    })
    if(sendUpdatedFaqs.ok) {
      alert("Faqs updated");
      location.reload();

    } else {
      alert("couldn't update Faqs");

    }
    updateIsPending(false);
    return false;
    */

  }



  return <form onSubmit={submitForm} className="max-w-screen-lg">
    <div className="border border-foreground p-4 mb-4">

      <DragDropProvider onDragEnd={handleDragEnd}onDragStart={handleDragStart}
        onDragOver={handleDragOver}>
                {items.map((section, index) => (
                  <SortableFaqSection
                    key={section.id}
                    section={section}
                    index={index}
                    questionEditing={questionEditing}
                    changeSectionTitle={changeSectionTitle}
                    deleteFaqSection={deleteFaqSection}
                    updateQuestion={updateQuestion}
                    updateQuestionEditing={updateQuestionEditing}
                    deleteQuestion={deleteQuestion}
                    addQuestion={() => {
                                          setItems(prev => {
                                            return prev.map(sectionOld => {
                                              if(sectionOld.id === section.id) {
                                                const newList = [...sectionOld.questions, ...[{
                                                  id:Date.now(),
                                                  question: "New Question",
                                                  answer: ""
                                                }]]
                                                return {...sectionOld, ...{questions:newList}}
                                              }
                                              return sectionOld
                                            })
                                          })

                                      }}
                  />
                ))}
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
