import { useState ,useRef} from "react"
import { RiFileImageLine } from "@remixicon/react"
import ReactButton from "../../../../components/ReactButton"



type TRequirement = [string|number,string]
type TRequirements = {
  minHeight?: TRequirement,
  minWidth?: TRequirement,
  maxFilesize?: TRequirement,
  maxWidth?: TRequirement,
  maxHeight?: TRequirement, 
  square?: TRequirement
}
type TUploadImageProps ={
  requirements?: TRequirements,
  fileCallback: Function,
  deletable?: boolean,
  accept: string[]
  errorCallback?: Function,
  formVal: string,
  uploadedImage?: string
}

export default function UploadImage({accept,uploadedImage,requirements,fileCallback,errorCallback}:TUploadImageProps) {
  console.log(uploadedImage);
  const [localFileUrl,updateLocalFileUrl] = useState<string|null>(null)
  const inputRef = useRef<null|HTMLInputElement>(null);
  const changeImage = async (imageFile:File) => {
    console.log(imageFile); 
    const reader = new FileReader(); 
    reader.onloadend = (e) => {
  
      if(e.target?.result) {
        if(e.target.result !== localFileUrl) {
          updateLocalFileUrl(e.target.result as string);
        }
      }
    }
    fileCallback(imageFile);
    reader.readAsDataURL(imageFile);
  }

  return <div className="flex">
    <div className={`-1/2 md:w-1/3 p-1   `}>
    {(!localFileUrl&&!uploadedImage) && (
      <div className="w-full border-foreground aspect-square flex-center-center border-2 border-dashed">
        <div className="flex-center-center flex-col"> 
          <RiFileImageLine className="mb-4" size={64} />
          <ReactButton label="Upload an image" type="action" onClick={()=> {
            if(inputRef?.current) {
              inputRef.current?.click()
            }
          }}/>
        </div>
      </div>
    )}
    
    {localFileUrl&& <img className="" src={localFileUrl} onLoad={()=>{console.log("loaded")}} />}
    {uploadedImage && <img src={uploadedImage} />}
    {(localFileUrl || uploadedImage) && <ReactButton type="action" label="Change image" onClick={()=> {
      if(inputRef?.current) {
              inputRef.current?.click()
            }
    }}/>}
    
    
    
    </div>
    

  <input type="file" className="hidden" ref={inputRef} accept={accept.join(",")} onChange={(e)=> {
    const t = (e.target as HTMLInputElement)
    if(t?.files && t.files[0]) {
        changeImage(t.files[0])
      }
  }}/>
  </div>
}