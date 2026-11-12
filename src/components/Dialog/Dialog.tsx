import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode} from "react"
import ModalContainer from "../ModalContainer/ModalContainer";
import ReactButton from "../Button/ReactButton";

type TDialogApi = {
  alert: (message: string, title?: string,caution?:boolean) => Promise<boolean>,
  confirm: (message:string,title?:string,caution?:boolean)=>Promise<boolean>
}
const DialogContext = createContext<TDialogApi | null>(null);
export function DialogProvider({ children }: { children: ReactNode }) {

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("")
  const [modalOpen, setModalOpen] = useState(false)
  const [dialogType, setdialogType] = useState<null | "confirm" | "alert">("confirm")
  const [caution, setCaution] = useState(false);
  const buttonActions = useRef({ confirm: () => { }, cancel: () => { console.log("initial one") } })
  const focusButton = useRef<HTMLButtonElement |HTMLAnchorElement |null>(null);
  const dialogRequest= (type: "alert" | "confirm", message: string, title?: string,caution?:boolean) :Promise<boolean> => {
    return new Promise((resolve) => {
      setdialogType(type);
      setMessage(message)
      if (title) setTitle(title);
      setModalOpen(true)
      setCaution(caution||false)
      function finish(result: boolean) {

        setModalOpen(false);
        setMessage("")
        setTitle("")
        setCaution(false)
        resolve(result)
      }
      buttonActions.current = {
        confirm: () => {
          finish(true)
        },
        cancel: () => {
          finish(false)
        }
      }
    })


  }
  const confirm = async (message: string, theTitle?: string,caution?:boolean) => {
    const result = await dialogRequest("confirm", message, (theTitle ? theTitle : undefined),caution);
    return result;
  }
  const alert = async (message: string, theTitle?: string,caution?:boolean) => {
    const result = await dialogRequest("alert", message, (theTitle ? theTitle : undefined),caution);
    return result;
  }

  useEffect(() => {
    if (!modalOpen || !focusButton.current) return;
    focusButton.current.focus();
  }, [modalOpen])

  const setRef = (el: HTMLButtonElement | HTMLAnchorElement) => {
    focusButton.current = el;
  }


  return <DialogContext.Provider value={{alert,confirm}}>
    {children}
    {modalOpen&&<ModalContainer>
      <div className="p-gutter">
        <div className="font-bold font-heading text-xl">{title ? title : message}</div>
        {title && <div className="pt-2">{ message}</div>}
      </div>
      <div className="flex justify-end border-t px-4 py-3 border-foreground">
        {dialogType=="confirm"&&<div className="pr-3">
          <ReactButton setRef={setRef} modClasses={["ghost"]} label="Cancel" onClick={() => { buttonActions.current.cancel() }}></ReactButton>
        </div>}
        <ReactButton modClasses={caution?["caution"]:undefined} classes="" label={dialogType == "alert" ? "Ok" : "Yes"} onClick={dialogType=="alert"?() => { buttonActions.current.cancel() }:()=>{buttonActions.current.confirm()}}></ReactButton>

      </div>


    </ModalContainer>}
  </DialogContext.Provider>
}

export function useDialog() {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error("useDialog must be used inside DialogProvider");
  }
  const { confirm, alert } = context;
  return {confirm,alert}
}
