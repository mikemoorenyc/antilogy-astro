import { cloneElement, type ReactElement, type ReactNode } from "react"
import type { Button } from "./types"



type ReactButton = Omit<Button, 'icon'> & {
  icon?: ReactNode | undefined,
  onClick?: ()=>void
}



export default function ReactButton (props:ReactButton) {
  const {label,icon,modClasses=[],type="action",classes,onClick,href,target} = props

  
  const modString = modClasses.join(" ")
  
  const classString = `button-component no-underline hover:no-underline ${classes||""} ${modString}`
  
  const iconComp = icon? cloneElement(icon as ReactElement<any>, {width:14,height:14}) : null

 

  const Interior = ({icon,label}:{label:string,icon?:ReactNode|undefined}) => {
    return <>
        {icon && <span className="svg-container">{iconComp}</span>}
        {label && <span>{label}</span>}
    </>
  }
  if(type == "action") {
    return <button disabled={modClasses.includes("disabled")} className={classString} onClick={onClick?(e)=> {
      e.preventDefault(); 
      onClick();
    }:undefined}>
    <Interior icon={icon} label={label} />
  </button>
  }
  if(type == "link") {
    return <a className={classString} href={href} target={target}><Interior label={label} icon={icon} /></a>
  }
  
}