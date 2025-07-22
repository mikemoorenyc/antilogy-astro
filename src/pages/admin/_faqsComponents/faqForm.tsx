import React, { useState } from "react";
import type { TFaq, TFaqSection } from "../../api/faqs"
import { DragDropContext, Droppable, Draggable, type DragUpdate } from '@hello-pangea/dnd';
import ReactButton from "../../../components/ReactButton";
import FaqSectionHeader from "./FaqSectionHeader";

import { EllipsisVerticalIcon } from "@heroicons/react/20/solid";
import { EllipsisVerticalIcon as EllipsisSm } from "@heroicons/react/16/solid";
import idleDirective from "astro/runtime/client/idle.js";
import FaqQuestion from "./FaqQuestion";

export default function ({faqs}:{faqs:TFaqSection[]}){
  const [items,setItems] = useState<TFaqSection[]>([{id:234,title:"Test",questions:[]}]);

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
  const deleteFaqSection = (item:TFaqSection) => {
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
 


  return <form className="max-w-screen-lg"><div className="border border-foreground p-4 mb-4">
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
                    <FaqSectionHeader changeSectionTitle={(newTitle:string) => {
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
                                 className="border border-foreground border-dotted ml-5 bg-background" 
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  
                                >
                                <div className="flex p-1">
                                  <div {...provided.dragHandleProps} className="pt-1">
                                    <EllipsisSm className="w-4 h-4"/>
                                  </div>
                                  <div className="flex-1">
                                    <FaqQuestion question={q}/>
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
  <ReactButton modClasses={["big"] } label="Add a FAQ section" onClick={
    () => {
      setItems(prev => {
      return [...prev, ...[{
        title: "New Section",
        id: Date.now(),
        questions:[]
      }]]
    })
    }
  }/></form>
}