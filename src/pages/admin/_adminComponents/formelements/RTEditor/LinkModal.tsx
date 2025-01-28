import { useState,useEffect,useRef } from "react";
import { createPortal } from "react-dom";
import ReactButton from "../../../../../components/ReactButton";
import { RiCloseCircleFill } from "@remixicon/react";

type TProps = {
  isOpen: boolean,
  currentValue: string, 
  saveCallback: Function,
  closeCallback: Function
}

export default function LinkModal({currentValue,saveCallback,closeCallback}:TProps) {
  const [linkValue,updateLinkValue] = useState(currentValue||"");
  const inputRef = useRef<null|HTMLInputElement>(null);
  const containerRef = useRef<null|HTMLDivElement>(null)
  const modalContainer = document.getElementById("modal-container");
  
  useEffect(()=> {
    if(!inputRef)return; 
    console.log("asddfasdf")
    inputRef.current?.focus();
  },[])
  const btnTracker = (e:KeyboardEvent) => {
    const code = e.code; 
    if(code === "Escape") {
      closeCallback();
      return false; 
    }
    if(code=="Enter") {
      saveValue();
      return false; 
    }
    
  }

  useEffect(()=> {
    document.body.addEventListener("keydown", btnTracker)
    return () => {
      document.body.removeEventListener("keydown",btnTracker)
    }
  },[])

  const saveValue = () => {
    saveCallback(linkValue);
    closeCallback();
  }
  
  return <>
  {modalContainer && createPortal((
    <div className="fixed inset-0 flex-center-center bg-[rgba(255,255,255,.75)] pb-24">
      <div ref={containerRef} className="border-2 border-foreground bg-shadow bg-background p-5 pt-2 ">
      <div className="flex justify-between pb-3 items-center">
        <div className="font-bold pt-2">{currentValue?"Edit":"Add"} Link</div>
        <button className="block p-2 relative mr-[-8px]" onClick={()=>{closeCallback()}}><RiCloseCircleFill /></button>
      </div>
      <div className="flex">
      <input className="mr-2 w-64 border-2 border-foreground px-1 focus:border-action" ref={inputRef} type="text" value={linkValue} onChange={(e)=>{e.preventDefault();updateLinkValue(e.target.value)}} />
      <ReactButton label="Save" type="action" onClick={()=>{saveValue();}}/>
      
      </div>
      
      </div>
    
    </div>
  ),modalContainer)}
  
  </>
}