import type { ReactNode } from "react";


export default function SelectInput({children, onChange,value}:{children:ReactNode,onChange:Function,value:string}) {

  
  return <select  onChange={(e)=> {
    onChange(e.target.value);
  }} className=" block border-2 border-foreground text-sm uppercase px-2">
    {children}
  
  </select>
}