import type { TContactFormSection, TFormSectionOption } from "@/actions/settings/schema";
import ReactButton from "@/components/Button/ReactButton";
import { DragDropProvider } from "@dnd-kit/react";
import { move } from "@dnd-kit/helpers";
import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";
import { useSortable } from "@dnd-kit/react/sortable";

type TOption = {
  label: string, id: number
}
type TProps = {
  section: TContactFormSection,
  updater: (section:TContactFormSection) => void;
}
export default function ({ section, updater }: TProps) {
  const [tempOptions, setTempOptions] = useState(section.options || [])
  const [optionEditing,setOptionEditing] = useState<null|string>(null)

  useEffect(() => {
    if (!section.options || !section.options.length) {
      setTempOptions([{
        id: "option-"+Date.now(),
        label:"New option"
      }])
    }
  },[])
  useEffect(() => {
    console.log("update")
    updater({...section,...{options:tempOptions}})
  }, [tempOptions])

  const deleteItem = (id: string) => {
    setTempOptions(prev => prev.filter(p => p.id !== id));
  }
  const updateItemText = (id: string, text: string) => {
    setTempOptions(prev => prev.map(option => {
      if (option.id !== id) return option;
     return {...option,...{label:text}}
    }))
  }

  return <div>
    <div className="font-bold text-smDisplay uppercase">Options</div>
    <DragDropProvider
      onDragStart={()=>{setOptionEditing(null)}}
      onDragOver={(event) => {setTempOptions((items) => move(items, event));}}
    >
      {tempOptions.map((option, index) => <OptionItem key={option.id}  {...{setOptionEditing,index,option,deleteItem, optionEditing,updateItemText}} canDelete={tempOptions.length>1 } />)}
    </DragDropProvider>

    <div className="pt-2">
      <ReactButton icon={<span className="icon-[carbon--add]" />} modClasses={["sm", "ghost"]} label={"Add option"}
        onClick={() => {
          setTempOptions(prev => {
            return [...prev, ...[{
              id: "option-"+Date.now(),
              label: "New Option"
            }]]
          })
        }}

      ></ReactButton>
    </div>
    </div>
}
type TOptionProps = {
  option: TFormSectionOption
  index: number,
  canDelete: boolean,
  deleteItem: (id: string) => void,
  updateItemText: (id: string, text: string) => void;
  setOptionEditing: Dispatch<SetStateAction<null | string>>
  optionEditing:null|string
}
const OptionItem = (props: TOptionProps) => {
  const { option, canDelete, index, deleteItem, updateItemText,optionEditing ,setOptionEditing} = props
  const { label, id } = option;

  const [tempText, updateTempText] = useState(label);
  const inputRef = useRef<null | HTMLInputElement>(null);
  const canSave = tempText.length > 1;
  const isEditing = optionEditing == id;

  const { ref, handleRef } = useSortable({
    id,index
  })

  const saveOrCancel = (e: React.KeyboardEvent) => {

    if (e.code == "Escape") {
      e.preventDefault()
      updateTempText(label);
      setOptionEditing(null)
      return false;
    }
    if (e.code == "Enter") {
      e.preventDefault()
      if (!canSave) {

        return;
      }
      updateItemText(id, tempText);
      setOptionEditing(null);
      return false;
    }
  }
  return <div className="flex items-center p-1 border bg-background border-foreground my-1" ref={ref}>
    <span ref={handleRef} className={`icon-[carbon--draggable] size-4 cursor-grab ${optionEditing?"invisible":""}`}></span>
    <input  onKeyDown={saveOrCancel} ref={inputRef} value={tempText} onChange={(e)=>{updateTempText(e.target.value)}} type="text" className={`flex-1 border ${!canSave?"border-caution":"border-background"} text-sm ${!isEditing?"hidden":""}`}></input>
    <div className={`flex-1 text-sm text-ellipsis ${isEditing?"hidden":""}`}>{tempText}</div>
    <div className="flex items-center">

      <button  disabled={!canSave||(optionEditing!==null && !isEditing)} className="flex disabled:opacity-5" onClick={(e) => {
        e.preventDefault();
        if (isEditing) {
          if (!canSave) return;
          updateItemText(id, tempText);
          setOptionEditing(null)
          return;
        }
        setOptionEditing(id);

          setTimeout(() => {
            if (inputRef.current) {
              inputRef.current.focus()
              if (tempText === "New Option") {
                inputRef.current.select()
              }
            }
          },100)


      }}><span className={`${isEditing?"icon-[carbon--checkmark]":"icon-[carbon--edit]"} size-4`} /></button>
      {canDelete && <button className="ml-1 flex" onClick={(e) => {
        e.preventDefault();
        deleteItem(id)
      }}>
        <span className="size-4 icon-[carbon--trash-can] text-caution"/>
      </button>}

    </div>
  </div>
}
