import { RiCheckFill } from "@remixicon/react";

export default function CheckBox({checked,onChange,label,id}:{checked:boolean,onChange:Function,label:string,id:string}) {

  return <div>
  <label htmlFor={id} className="flex">
  
    <input className="hidden" type="checkbox" id={id}  onChange={()=> {
     
      onChange(!checked);
    }}/>
  <div className={`flex-center-center border-2 border-foreground w-5 h-5 ${checked? "bg-foreground":""}`}>
    {checked && <RiCheckFill size={16} className="fill-background"/>}
  </div>
  
  <span className="text-sm ml-2">{label}</span>
  </label>
  
  </div>
}