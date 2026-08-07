import type { ReactNode } from "react";


export default function FormContainer({label,children,formId,helperText}:{label:string,children:ReactNode,formId?:string,helperText?:string}) {

  return <div className="mb-8 md:grid grid-cols-5">
    <label className=" md:mt-2 text-sm uppercase mb-1 block " htmlFor={formId}>{label}</label>
    <div className=" col-span-4">
      {children}
      {helperText&& <div className="mt-1 text-xs uppercase">{helperText}</div>}
    </div>
  
  </div>

}