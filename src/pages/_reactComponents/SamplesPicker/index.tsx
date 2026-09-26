import type { TImageUrls } from "@/types"

import { createPortal } from "react-dom"
import { useEffect, useState } from "react"
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { XMarkIcon } from "@heroicons/react/24/outline";
export default function ({ imageUrls }: { imageUrls: TImageUrls[] }) {
  const [openImage, updateOpenImage] = useState<TImageUrls | null>(null)
  const modalContainer = document.getElementById("modal-container")
  useEffect(() => {
    if (openImage !== null) {
      document.body.classList.add("sample-open")
    } else {
      document.body.classList.remove("sample-open")
    }
    return () => {
      document.body.classList.remove("sample-open")
    }
  },[openImage])


  return <div className={"dt-width-container"}>
    <ul className={"samples-container-ul"}>
      {imageUrls.map((i) => <li className={"sample-li"} key={i.thumbnail.src}>
        <img className={"samples-image"} src={i.thumbnail.src} srcSet={i.thumbnail.srcSet} />
        <button className={"samples-image-overlay"} onClick={(e) => {
          e.preventDefault();
          updateOpenImage(i)
        }}>
          <span className={"samples-image-overlay-icon-container"}>
            <svg className={"samples-image-overlay-icon size-6"} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" >
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
            </svg>
          </span>

        </button>
      </li>)}
    </ul>
    {openImage !== null && modalContainer && createPortal(<>
      <TransformWrapper centerOnInit={true} wheel={{disabled:true}}>
        <TransformComponent wrapperStyle={{ background:"var(--bg)",position: "fixed", left: 0, top: 0, width: "100%", height: "100%", cursor: "grab",zIndex:998 }}>
          <img src={openImage.full.src}  alt="A screenprinting image on fabric" className="panner"/>
                  </TransformComponent>
                  </TransformWrapper>
      <button style={{ position: "fixed", right: 24, top: 24, zIndex: 999 }} className="sample-zoom-close" onClick={(c)=>{c.preventDefault(); updateOpenImage(null)}}>
                    <XMarkIcon width={24} height={24}/>
                  </button>
    </>,modalContainer)}
  </div>
}
