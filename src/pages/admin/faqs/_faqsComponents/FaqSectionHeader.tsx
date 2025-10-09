
import { CheckIcon, PencilIcon, TrashIcon } from "@heroicons/react/20/solid"
import type { FaqSection } from "@/pages/api/faqs/types"

import { useRef,useState,useEffect, useMemo, useCallback, } from "react"



type Props = {
 
  section: FaqSection,
  deleteItem: ()=>void,
  changeSectionTitle:(title:string)=>void
}
export default function FaqSection ({section,deleteItem,changeSectionTitle}:Props) {
  const inputRef = useRef<null|HTMLInputElement>(null)
  const [tempTitle,updateTempTitle] = useState(section.title || "");
  const [editingTitle,updateEditingTitle] = useState(false);
  useEffect(()=> {
    if(editingTitle) {
      inputRef.current?.focus()
    }
  },[editingTitle])



  useEffect(()=> {
    const escapePress = (e:KeyboardEvent)=> {
      if(!editingTitle) return ; 
      
 if(e.code === "Escape") {
          updateTempTitle(section.title);
          updateEditingTitle(false)
      } 
      if(e.code === "Enter") {
        
        changeSectionTitle(tempTitle);
  updateEditingTitle(false);
      }
    }

    document.body.addEventListener("keydown", escapePress)
    return () => {
      document.body.removeEventListener("keydown",escapePress)
    }
  },[tempTitle])
  return <>
{!editingTitle && <div className="flex-1 font-bold text-lg">{section.title || "(No title)"}</div>}
{editingTitle && <input onBlur={() => {
  updateEditingTitle(false);
  updateTempTitle(section.title);
}} className="flex-1 border border-foreground block" ref={inputRef} type="input" value={tempTitle} onChange={(e) => {
  e.preventDefault(); 
  updateTempTitle(e.target.value);
}}/>}
<div className="flex">
  {!editingTitle && <button className="block"> 
    <PencilIcon className="w-5 h-5" onClick={((e)=>{e.preventDefault(); 
    
    updateEditingTitle(true);
     
    
    })}/>
  
  </button>}
  {editingTitle && <button onClick={(e) => {
    e.preventDefault(); 
    changeSectionTitle(tempTitle);
    updateEditingTitle(false)
  }}>
    <CheckIcon className="w-5 h-5"/> 
  </button>}
  <button className="block">
    <TrashIcon className="w-5 h-5 ml-2 text-caution" onClick={(e)=> {
      e.preventDefault(); 
      if(!confirm("Are you sure about deleting this? ")) return ; 
      deleteItem(); 
    }}/>

  </button>

</div>  
  
  </>
}