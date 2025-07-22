import { useEffect, useRef, useState } from "react";
import type { TContactFormSection } from ".";
import type { ReactNode } from "react";
import {commonSettings,formComponents} from "./settings"
import TextInput from "./TextInput";
import CheckBox from "./CheckBox";
import SelectInput from "./SelectInput";
import ReactButton from "../../../../components/ReactButton";

type TSchema = {
  title: string,
  otherSettings?: {[key:string]:any}
}
const FieldWrapper = ({children,className}:{children:ReactNode,className?:string}) => {
  return <div className={`mb-4 ${className}`}>
    {children}
  </div>
}

export default function EditPanel({section,closer,saver}:{section:TContactFormSection,closer:Function,saver:Function}) {
  
  const [tempData,updateTempData] = useState(section); 
  const containerRef=useRef<null|HTMLDivElement>(null)
console.log(section);
console.log(tempData);
  useEffect(()=> {
    if(!containerRef)return; 
    //containerRef.current?.scrollIntoView(true);

  },[containerRef])

  const updater = (payload:TContactFormSection) => {
    updateTempData(prev => {
      return {...prev,...payload}; 
    })
  }
  
  const sectionSchema:TSchema = formComponents[section.fieldType as keyof {}];

  if(!sectionSchema) return <div>No schema found</div>
  return <div ref={containerRef}  className={`border border-foreground p-3 mx-2 mb-4 ${section.width == "half"?"w-[calc(50%-1rem)]":"w-full"}`}>
    <div>
    <FieldWrapper>
      <TextInput required={true} onChange={(value:string)=>{
        const payload = {...tempData};
        payload.label = value; 
        updater(payload);
    }} value={tempData.label} id={"title"} label={"Section Name"}/>
    
    </FieldWrapper>
    <FieldWrapper className="flex-center">
      <CheckBox checked={tempData.required} id={"required"} label="Required" onChange={(value:boolean) => {
       
        const payLoad = {...tempData};
        payLoad.required = value; 
        updater(payLoad);
      }}/>
      <div className="ml-4">
      <label className="block text-xs uppercase">Section width</label>
      <SelectInput value={tempData.width} onChange={(value:"half"|"full")=> {
          console.log(value);
        const payload = {...tempData};
        payload.width = value;
        updater(payload)
      }}>
        <option id="half" value="half">Half Width</option>
        <option id="full" value={"full"}>Full width</option>
      
      </SelectInput>
      </div>
    
    </FieldWrapper>
    
    <FieldWrapper>
      <TextInput value={tempData.helperText||""} id="helperText" label="Helper Text" onChange={(value:string)=> {
        const payLoad = {...tempData};
        payLoad.helperText = value;
        updater(payLoad)
      }}/>
    
    </FieldWrapper>
    {sectionSchema?.otherSettings && Object.entries(sectionSchema?.otherSettings).map((s)=> {
      
      const type = s[1]?.type; 
      return <FieldWrapper key={s[0]}>
      {type == "textField" && <TextInput value={tempData[s[0] as keyof {}]||""} id={s[0]} label={s[1]?.label} onChange={(value:string)=> {
        const payLoad = {...tempData};

        if(s[0] == "options") {
          payLoad[s[0] ] = value; 
        }
        updater(payLoad);
      }} />}
      {type == "numberField" && <TextInput type={"number"} value={tempData[s[0] as keyof {}]||0} id={s[0]} label={s[1]?.label} onChange={(value:number)=> {
        const payLoad = {...tempData};

        if(s[0] == "min"||s[0]=="max") {
          payLoad[s[0] ] = value; 
        }
        updater(payLoad);
      }} />}
      {s[1]?.description && <div className="text-xs">{s[1]?.description}</div>}
      </FieldWrapper>
    })}
    <FieldWrapper>
      <ReactButton label={"Save"} onClick={()=>{saver(tempData);closer();}} classes="mr-2"/>
      <ReactButton label="Cancel" modClasses={["ghost"]} onClick={()=>{closer()}} />
    </FieldWrapper>
    </div>  


  </div>
}