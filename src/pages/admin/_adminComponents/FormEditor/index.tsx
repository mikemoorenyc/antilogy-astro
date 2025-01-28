import { useState } from "react"
import ReactButton from "../../../../components/ReactButton"
import { RiAddCircleFill } from "@remixicon/react"
import { formComponents } from "./settings"
import SelectInput from "./SelectInput"
import EditPanel from "./EditPanel"
export type TContactFormSection = {
  id: number|"new", 
  fieldType:string,
  label:string,
  required:boolean,
  helperText?:string,
  width: "half"|"full"
}
type TProps = {
  data:TContactFormSection[],
  updateCallback:Function
}

export default function FormEditor(props:TProps) {
  const {data,updateCallback} = props
  const [addFieldOpen,updateAddFieldOpen] = useState(false);
  const [addOption,updateAddOption] = useState("");
  const [currentlyEditing,updateCurrentlyEditing] = useState<null|TContactFormSection>(null)

  const typeOptions = Object.entries(formComponents)
  
  const formUpdate = (item:TContactFormSection) => {
    console.log(item);
    const newData = [...data];
    if(item.id == "new") {
      updateCallback([...newData,...[item]]);
      return ;
    }

  }
  return <div className="mb-5 border border-foreground p-4">

  <div className="fields">
  {data.map((item:TContactFormSection,i) => {
    const itemType = typeOptions.find(e => e[0] == item.fieldType);
    if(!itemType) {
      return null ; 
    }
    if(item.id === currentlyEditing?.id) {
      return <EditPanel key={item.id} saver={formUpdate} closer={()=>{updateCurrentlyEditing(null)}} section={currentlyEditing} />
    }
    return (
      <div className="border border-foreground p-2 border-dashed text-sm" key={item.id}>
        <div><b>{item.label}</b> - {itemType[1]?.title}</div>
        <div>Required: {item.required?"Yes":"No"}</div>
        {item.helperText && <div>Helper Text: {item.helperText}</div>}
        <div>
          <ReactButton modClasses={["sm","ghost"]} onClick={()=>{}} label="Edit"/>
        </div>
      </div>
    )
    
  }

  )}
  

  {currentlyEditing?.id == "new" && <EditPanel saver={formUpdate} closer={()=>{updateCurrentlyEditing(null)}} section={currentlyEditing}/>}
  
  </div>

  <div className="mt-6">
    {(!addFieldOpen && !currentlyEditing) && <ReactButton icon={<RiAddCircleFill />} type="action" modClasses={["ghost"]} label="Add new field" onClick={()=>{updateAddFieldOpen(true);updateAddOption(typeOptions[0][0])}}/>}
    {addFieldOpen && <div className="flex">
      <SelectInput value={addOption} onChange={(value:string)=>{updateAddOption(value);console.log(value)}}>
      {Object.entries(formComponents).map((e) => <option key={e[0]} value={e[0]}>{e[1].title}</option>)}
      
      </SelectInput>
      <ReactButton classes="ml-2 mr-1" modClasses={["sm"]} label={"Add"} onClick={()=>{
        updateAddFieldOpen(false);
        updateCurrentlyEditing({
          id:"new",
          label:"New Section",
          required: false, 
          width: "half",
          fieldType:addOption
        })
        updateAddOption("");
      }} type="action"/>
      <ReactButton modClasses={["sm","ghost","caution"]} label={"Cancel"} type="action" onClick={()=>{updateAddFieldOpen(false);}}/>
        
      
      
    </div>}
  </div>
  </div>
}