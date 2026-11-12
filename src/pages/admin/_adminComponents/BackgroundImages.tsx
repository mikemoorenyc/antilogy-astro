import type { TBackgroundImageValues } from "@/actions/settings/schema"
import UploadImage from "./formelements/UploadImage"
import { useEffect, useRef, type ReactNode } from "react"
import ReactButton from "@/components/Button/ReactButton"
import { useDialog } from "@/components/Dialog/Dialog"
import { useState } from "react"
import { createPortal } from "react-dom"

type TProps = {
  backgroundImages: TBackgroundImageValues[],
  addImage: (file: { file: File,  dataUrl:string,settingsKey:"backgroundImages"}) => void,
  deleteImage: (public_id:string) => void
}


const ImgContainer = (props: { needsTop:boolean,children: ReactNode }) => {
  let {children,needsTop} = props
  return <li className={ `relative flex items-center justify-center aspect-square group border border-foreground border-t-0 border-l-0`}>
    {children}
  </li>
}

export default function (props: TProps) {
  const {alert,confirm} = useDialog()
  const { backgroundImages, addImage, deleteImage } = props
  const [fullScreen, updateFullScreen] = useState<null | string>(null)
  const modalContainer = useRef<null|HTMLElement>(null)
  const inputRef = useRef<null | HTMLInputElement>(null)
  const needsTop = backgroundImages.length < 2
  useEffect(() => {
    const modalC = document.getElementById("modal-container");
    if (modalC) {
      modalContainer.current = modalC
    }
  },[])
  const imageAdded = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const t = e.target;
    if (!t.files || t.files.length > 1) {
      await alert("Couldn't add file");
      return;
    }
    const f = t.files[0];
    let size = (f.size / (1024 * 1024))
    if(size > 8) {
     await alert(`${f.name} is too big. Must be less than 10mb`)
      return ;
    }
    console.log(f);
    const reader = new FileReader();
    reader.onloadend = async (e) => {
      if (!e.target?.result||typeof e.target.result !== "string") {
        await alert("Couldn't add file");
        return;
      }


      addImage({

        file:f,
        dataUrl: e.target.result,
        settingsKey:"backgroundImages"
      })
    }
    reader.readAsDataURL(f);


  }
  const deleteClick = async (id: string) => {
    const ok = await confirm("This cannot be undone", "Are you sure you want to delete this?", true);
    if (ok) {
      deleteImage(id);
    }
  }
  return <ul className={`
    grid auto-rows-auto grid-cols-3 md:grid-cols-4 border border-foreground border-r-0 border-b-0 relative
    after:content-[''] after:block after:absolute after:w-[1px] after:top-[0] after:right-[0] after:bottom-[0] after:bg-foreground
    before:content-[''] before:block before:absolute before:h-[1px] before:bottom-[0] before:right-[0] before:left-0 before:bg-foreground
    ` }>
    {backgroundImages.map(i => {
      return <ImgContainer {...{ needsTop }} key={i.public_id}  >
        <img src={i.url} className="absolute left-0 top-0 w-[100%] h-[100%] object-cover object-center" />
        <div className="absolute bottom-gutter left-[50%] translate-x-[-50%] hidden group-hover:block">
          <ReactButton onClick={()=> {deleteClick(i.public_id)}} modClasses={["sm", "caution"]} icon={<span className="icon-[carbon--trash-can] size-3" /> } label={"Delete"}></ReactButton>
        </div>
        <button className="hidden group-hover:block absolute right-2 top-2 p-2 bg-background rounded-full border border-foreground" onClick={(e) => { e.preventDefault(); updateFullScreen(i.url) }}>
          <div className="icon-[carbon--fit-to-screen] block size-4"></div>
        </button>
      </ImgContainer>
    })}
    <ImgContainer {...{needsTop}} >
      <input accept="image/jpeg,image/png" type="file" ref={inputRef} className="hidden" onChange={imageAdded}
      />
      <div className="absolute flex items-center justify-center bg-background inset-0">
        <ReactButton onClick={() => {
          if (inputRef && inputRef.current) {
            inputRef.current.click();
          }
        }} label="Upload image" />
      </div>
    </ImgContainer>
    <li>
      {(modalContainer.current && fullScreen) && createPortal(<div className=" bg-no-repeat bg-background fixed inset-0 z-[9999] bg-contain bg-center"
        style={{backgroundImage:`url(${fullScreen})`}}
      >
        <button onClick={(e) => { e.preventDefault(); updateFullScreen(null) }} className="bg-background rounded-full border border-foreground p-3 absolute right-gutter top-gutter">
          <div className="icon-[carbon--close-large] size-4 block"/>
        </button>
      </div>,modalContainer.current)}
    </li>
  </ul>
}
