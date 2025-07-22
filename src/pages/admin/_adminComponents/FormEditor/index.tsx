import { useState } from "react"
import ReactButton from "../../../../components/ReactButton"

import { formComponents } from "./settings"
import SelectInput from "./SelectInput"
import EditPanel from "./EditPanel"
import { ArrowDownIcon, ArrowUpIcon, PencilIcon, TrashIcon } from "@heroicons/react/16/solid"
import { PlusCircleIcon } from "@heroicons/react/16/solid"

export type TContactFormSection = {
  id: number|"new", 
  fieldType:string,
  label:string,
  required:boolean,
  helperText?:string,
  width: "half"|"full",
  min?: number, 
  max?: number, 
  options?: string 
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
  
  const formUpdate = (item:TContactFormSection,toDelete:boolean) => {
 
    const newData = [...data];
    if(item.id == "new") {
      const itemWId = {...item, ...{id: Date.now()}}
      updateCallback([...newData,...[itemWId]]);
      return ;
    }
    if(toDelete) {
      updateCallback(newData.filter(old => {
        return old.id !== item.id; 
      }))
      return 
    }
    updateCallback(newData.map(d => {
      if(d.id === item.id) {
        return item; 
      }
      return d; 
    }))

  }
  const switchOrder = (item:TContactFormSection,goingUp?:boolean) => {
    const currentState = [...data];
    const itemIndex = data.findIndex(i => i.id === item.id); 
    if(itemIndex < 0) {console.log("index not found");return};
    const itemToMove = currentState.splice(itemIndex,1)[0];
    currentState.splice(goingUp? itemIndex-1 : itemIndex+1 ,0,itemToMove)
    updateCallback(currentState);

  }
  return <div className="mb-5 border border-foreground ">

  <div className="fields flex flex-wrap w-full py-4 px-2">
  {data.map((item:TContactFormSection,i) => {
    const itemType = typeOptions.find(e => e[0] == item.fieldType);
    if(!itemType) {
      return null ; 
    }
    if(item.id === currentlyEditing?.id) {
      return <EditPanel key={item.id} saver={formUpdate} closer={()=>{updateCurrentlyEditing(null)}} section={currentlyEditing} />
    }
    return (
      <div className={`border border-foreground p-2 border-dashed mx-2 text-sm mb-4 ${item.width == "half"?"w-[calc(50%-1rem)]":"w-full"}`} key={item.id}>
        <div><b>{item.label}</b> - {itemType[1]?.title}</div>
        <div>Required: {item.required?"Yes":"No"}</div>
        {item.helperText && <div>Helper Text: {item.helperText}</div>}
        <div className="mt-1">
          <ReactButton icon={<PencilIcon />} modClasses={["sm","ghost"]} onClick={()=>{
            updateCurrentlyEditing(item); 
          }} label="Edit" classes="px-0 mr-2"/>
          {i!== 0 && <ReactButton icon={<ArrowUpIcon />} modClasses={["sm","ghost"]}label="Move up" onClick={()=>{switchOrder(item,true)}} classes="px-0 mr-2" />}
          {i!== data.length - 1 && <ReactButton icon={<ArrowDownIcon />} label="Move down" modClasses={["sm","ghost"]} onClick={()=>{switchOrder(item,false)}} classes="px-0 mr-2" />}
          <ReactButton icon={<TrashIcon />}modClasses={["sm","ghost","caution"]} onClick={()=>{
            const okToDelete = confirm("Are you sure you want to delete this section? It can't be undone.");
            if(!okToDelete) return ; 
            formUpdate(item,true);

          }} label="Delete" classes="px-0 mr-2"/>
        </div>
      </div>
    )
    
  }

  )}
  

  {currentlyEditing?.id == "new" && <EditPanel saver={formUpdate} closer={()=>{updateCurrentlyEditing(null)}} section={currentlyEditing}/>}
  
  </div>

  <div className="my-6 mx-4 mt-0">
    {(!addFieldOpen && !currentlyEditing) && <ReactButton icon={<PlusCircleIcon />} type="action" modClasses={["ghost"]} label="Add new field" onClick={()=>{updateAddFieldOpen(true);updateAddOption(typeOptions[0][0])}}/>}
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