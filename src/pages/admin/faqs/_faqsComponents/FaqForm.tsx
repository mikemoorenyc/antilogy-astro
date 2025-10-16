import React, { useEffect, useState, type SyntheticEvent } from "react";
import type { FaqSection } from "@/pages/api/faqs/_types";
import { DragDropContext, Droppable, Draggable, type DragUpdate } from '@hello-pangea/dnd';
import ReactButton from "../../../../components/Button/ReactButton";
import FaqSectionHeader from "./FaqSectionHeader";

import { EllipsisVerticalIcon } from "@heroicons/react/20/solid";
import { EllipsisVerticalIcon as EllipsisSm } from "@heroicons/react/16/solid";

import FaqQuestion from "./FaqQuestion";
import SaveFooter from "../../_adminComponents/formelements/SaveFooter";

export default function FaqForm({faqs}:{faqs:FaqSection[]}){
  const [items,setItems] = useState<FaqSection[]>(faqs);
  const [formUpdated,updateFormUpdated] = useState(false);
  const [isPending,updateIsPending] = useState(false);
  const [questionEditing,updateQuestionEditing] = useState<boolean>(false)

  const beforeUnload = (e:BeforeUnloadEvent) => {
    e.preventDefault();
  }
  useEffect(()=> {
    if(import.meta.env.DEV) return ; 
    if(!formUpdated) {
      window.removeEventListener('beforeunload', beforeUnload);
      return; 
    }
    window.addEventListener('beforeunload', beforeUnload);
      return ()=> {
        window.removeEventListener('beforeunload', beforeUnload);
      }
  },[formUpdated])


  useEffect(()=> {
    updateFormUpdated(JSON.stringify(items) == JSON.stringify(faqs))
  },[items])

  const handleDragEnd = (result:DragUpdate) => {
    const { source, destination, draggableId, type } = result;
    console.log(result);

    if (!destination) {
      return;
    }

    if (type === 'parent') {
      const newParentItems = Array.from(items);
      const [removed] = newParentItems.splice(source.index, 1);
      newParentItems.splice(destination.index, 0, removed);
      setItems(newParentItems);    
    }

    if (type === 'child') {
      
      const sourceParentIndex = items.findIndex((parent) => parent.id === parseInt(source.droppableId));
      const destinationParentIndex = items.findIndex((parent) => parent.id === parseInt(destination.droppableId));

      if (sourceParentIndex === destinationParentIndex) {
        const newParentItems = Array.from(items);
        console.log(newParentItems);
        const sourceParent = newParentItems[sourceParentIndex];
        console.log(sourceParent);
        const [removed] = sourceParent.questions.splice(source.index, 1);
        sourceParent.questions.splice(destination.index, 0, removed);

        setItems(newParentItems);
    
      } else {
        const newParentItems = Array.from(items);
        const sourceParent = newParentItems[sourceParentIndex];
        const destinationParent = newParentItems[destinationParentIndex];
        const [removed] = sourceParent.questions.splice(source.index, 1);
        destinationParent.questions.splice(destination.index, 0, removed);
        setItems(newParentItems);
      }
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

  const submitForm = async (e:SyntheticEvent) => {
    e.preventDefault(); 
    updateIsPending(true);
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

  }
 


  return <form onSubmit={submitForm} className="max-w-screen-lg"><div className="border border-foreground p-4 mb-4">
  <DragDropContext onDragEnd={handleDragEnd}>
    <Droppable droppableId="parent-list" type="parent" >
      {provided => (
        <div ref={provided.innerRef} {...provided.droppableProps} >
          {items.map( (i,parentIndex) => (
            <Draggable draggableId={i.id.toString()} index={parentIndex} key={i.id}>
              {(provided,snapshot) =>{
                  
                    return (
                      <div 
                    {...provided.draggableProps}
                    className={`bg-shadow-sm border border-foreground mb-4 p-2 bg-background ${snapshot.isDragging?"border":"border-dashed"}`}
                    ref={provided.innerRef}
                  >
                  <div className="flex-center mb-2">
                    <div  {...provided.dragHandleProps}>
                      <EllipsisVerticalIcon className="w-5 h-5"/>
                    </div>
                    <FaqSectionHeader {...{questionEditing}}changeSectionTitle={(newTitle:string) => {
                      console.log("gettiung called");
                      changeSectionTitle(i.id,newTitle)
                    }} section={i} deleteItem={()=>{deleteFaqSection(i)}} />
                  </div>
              
                  
                    <Droppable droppableId={i.id.toString()} type="child">
                    {(provided) => (
                      <div ref={provided.innerRef} {...provided.droppableProps}>
                      {!i.questions.length && <div style={{height: 32}} className="border border-foreground border-dotted ml-5"/>}
                      {i.questions.map((q,index)=> {
                        return <Draggable draggableId={q.id.toString()} index={index} key={q.id}>
                          {(provided, snapshot) => (
                            <div
                                 className={`border border-foreground border-dotted ml-5 bg-background ${index!==0?"mt-2":""}`} 
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  
                                >
                                <div className="flex p-1">
                                  <div {...provided.dragHandleProps} className="pt-1">
                                    <EllipsisSm className="w-4 h-4"/>
                                  </div>
                                  <div className="flex-1">
                                    <FaqQuestion {...{updateQuestionEditing}} updater={updateQuestion} question={q}/>
                                  </div>
                                </div>
                                
                            </div>

                          )}
                        </Draggable>
                      })}
                      {provided.placeholder}
                      </div>

                    )}
                  </Droppable>
                  
                
                  <div className="pl-5 py-3">
                    <ReactButton modClasses={["sm"]} label={"Add FAQ"} onClick={() => {
                      setItems(prev => {
                        return prev.map(section => {
                          if(section.id === i.id) {
                            const newList = [...section.questions, ...[{
                              id:Date.now(),
                              question: "New Question",
                              answer: ""
                            }]]
                            return {...section, ...{questions:newList}}
                          }
                          return section
                        })
                      })

                  }}/>
                  </div>
                  
                  </div>
                    )
              } 
                
              }
            </Draggable>
          ))}
          {provided.placeholder}
        </div>
      )}
    
    </Droppable>
  
  
  </DragDropContext>

  
  </div>
  <ReactButton modClasses={[] } label="Add a FAQ section" onClick={
    () => {
      setItems(prev => {
      return [...prev, ...[{
        title: "New Section",
        id: Date.now(),
        questions:[]
      }]]
    })
    }
  }/>
  <SaveFooter 
    {...{isPending,beforeUnload}}
    saveText="Save FAQs"
  />
  
  </form>
}