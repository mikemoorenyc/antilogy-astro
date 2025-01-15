import { cloneElement, type ReactElement, type ReactNode } from "react"
import { type IButton } from "../../types"



type ReactIButton = Omit<IButton, 'icon'> & {
  icon?: ReactNode | undefined,
  onClick?: Function 
}


export default function ReactButton (props:ReactIButton) {
  const {label,icon,modClasses=[],type="action",classes,onClick,href,target} = props
  
  const modString = modClasses.join(" ")
  
  const classString = `button-component hover:no-underline ${classes} ${modString}`
  
  const iconComp = icon? cloneElement(icon as ReactElement<any>, {size:14}) : null
 

  const Interior = ({icon,label}:{label:string,icon?:ReactNode|undefined}) => {
    return <>
        {icon && <span className="svg-container">{iconComp}</span>}
        <span>{label}</span>
    </>
  }
  if(type == "action") {
    return <button className={classString} onClick={onClick?(e)=> {
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