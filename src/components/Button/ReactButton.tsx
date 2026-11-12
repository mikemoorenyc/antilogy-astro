import { cloneElement, useEffect, useRef, type ReactElement, type ReactNode, type Ref } from "react"
import type { Button } from "./types"



type ReactButton = Omit<Button, 'icon'> & {
  icon?: ReactNode | undefined,
  onClick?: () => void,
  setRef?: (el: HTMLButtonElement | HTMLAnchorElement) => void,
  disabled?:boolean
}



export default function ReactButton (props:ReactButton) {
  const {setRef,label,icon,modClasses=[],type="action",classes,onClick,href,target} = props
  const btRef = useRef<HTMLButtonElement | null>(null)
  const aRef = useRef<HTMLAnchorElement|null>(null)

  const modString = modClasses.join(" ")

  const classString = `button-component no-underline hover:no-underline ${classes||""} ${modString}`

  const iconComp = icon? cloneElement(icon as ReactElement<any>, {width:14,height:14}) : null



  const Interior = ({icon,label}:{label:string,icon?:ReactNode|undefined}) => {
    return <>
        {icon && <span className="svg-container flex items-center justify-center">{iconComp}</span>}
        {label && <span>{label}</span>}
    </>
  }
  useEffect(() => {
    if (!setRef) return;
    if (type == "link"&&aRef.current) {
      setRef(aRef.current);
    }
    if (type == "action" && btRef.current) {
      setRef(btRef.current)
    }
  },[aRef,btRef])


  if(type == "action") {
    return <button ref={btRef} disabled={modClasses.includes("disabled")} className={classString} onClick={onClick?(e)=> {
      e.preventDefault();
      onClick();
    }:undefined}>
    <Interior icon={icon} label={label} />
  </button>
  }
  if(type == "link") {
    return <a ref={aRef} className={classString} href={href} target={target}><Interior label={label} icon={icon} /></a>
  }

}
