import { createPortal } from "react-dom";
import ReactButton from "../../../../components/Button/ReactButton";
import { useEffect, useState } from "react";
type TProps = {
  saveText:string, 
  beforeUnload:(e:BeforeUnloadEvent)=>void,
  isPending:boolean,

}

export default function SaveFooter(props:TProps){
  const {saveText,beforeUnload,isPending} = props;
  const [modalContainer,updateModalContainer] = useState<HTMLElement|null>(null);

  useEffect(()=> {
    if(!window) return ; 
    updateModalContainer(document.getElementById("modal-container"));
  },[])


  return <>
  <div className="flex-col md:flex-row flex-center  mt-12">
        <ReactButton label={saveText} type="action" classes="mb-3 md:mb-0 md:mr-3"  modClasses={["big","reverse"]}/>
        <ReactButton classes="" onClick={()=> {
          window.removeEventListener('beforeunload', beforeUnload);
          location.reload();
          return ; 
        }} label="Cancel" type="action" modClasses={["ghost","big"]}/>
    
    </div>
    <style dangerouslySetInnerHTML={{__html: isPending? `body{overflow:hidden}`:""}}></style>
  
  {modalContainer && isPending &&  createPortal(<>
    <div className="fixed inset-0 flex-center-center">
      <div className="bg-foreground border border-background w-72 h-72 flex-center-center">
        <div>
          <div className="text-3xl bold text-background font-bold uppercase text-center pt-10">Saving</div>
        <div className="squeegee-container">
          <div className="squeegee-screen"></div>
          <div className="squeegee-handle"></div>
          <div className="squeegee-ink"></div>
        </div>
        </div>
      </div>
    
    </div>
  
  </>,modalContainer)}
  
  </>

}