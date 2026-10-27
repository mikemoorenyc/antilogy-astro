import { createPortal } from "react-dom";
import { useState, useEffect, type ReactNode } from "react";

type TProps = {
  children: ReactNode,
  backgroundClick?: ()=>void
}

export default function ModalContainer({children}:{children:React.ReactNode}) {
  const [modalContainer, updateModalContainer] = useState<HTMLElement | null>(null);
  useEffect(() => {
    if (!window) return;
    updateModalContainer(document.getElementById("modal-container"));
  }, []);
  useEffect(() => {
    if (!modalContainer) return;
    const h = document.querySelector("html");
    if (!h) return;
    h.style.overflow = "hidden"
    return () => {
      if (h) {
        h.style.overflow=""
      }
    }
  },[modalContainer])
  return <>
    {modalContainer && createPortal(<>
      <div className="fixed  inset-0 flex items-center justify-center bg-[rgba(255,255,255,.75)]">
        <div
          style={{boxShadow:"3px 3px 0 var(--for)"}}
          className="
          fixed inset-0 overflow-y-auto overflow-x-hidden bg-background
          md:relative md:m-gutter md:max-w-[800px] md:max-h-[calc(100% - (var(--gutter)*3))] md:border-2 border-foreground md:translate-y-[-50px]
          ">
          {children}
        </div>
      </div>
    </>,modalContainer)}
  </>
}
