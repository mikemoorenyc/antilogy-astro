import { useSortable } from '@dnd-kit/react/sortable';
import { type TSampleImage } from '@/actions/settings/schema';
import { EllipsisVerticalIcon } from '@heroicons/react/24/outline';
import { useMemo, useState,type Dispatch,type SetStateAction }  from 'react';
import ReactButton from '@/components/Button/ReactButton';
import { PencilIcon, TrashIcon, XMarkIcon } from '@heroicons/react/16/solid';
type TProps = {
  index: number,
  updateEditingImage:Dispatch<SetStateAction<null | number>>
  image: TSampleImage,
  editingImage: null | number,
  updateAltText:(id:number,text:string)=>void
}
export default function SampleItem(props: TProps) {
  const [testValue,updateTestValue] = useState("asdfa asdf asdf")
  const { index, image ,editingImage,updateEditingImage,updateAltText} = props;
  const { ref, handleRef } = useSortable({ id: image.id, index });
  const currentlyEditing = useMemo(()=>editingImage === image.id, [editingImage,image])
  return <li className='border border-dashed border-foreground mb-4 p-2 flex items-start bg-background' ref={ref}>
    <div className='cursor-grab' ref={handleRef}style={{visibility:editingImage!==null?"hidden":undefined}}>
      <EllipsisVerticalIcon className='w-6 h-6' />
    </div>
    <img src="/bgs/a24.jpg" className='w-48 ml-2' />
    <div className='flex-1 ml-2 mr-6'>
      <div className='font-bold'>Alt text (required):</div>
      <div className='flex items-center'>
        <input
          className={`border ${!image.altText?"border-caution":"border-foreground"} p-1 flex-1 `}
          value={image.altText || ""} onChange={(e) => { updateAltText(image.id, e.currentTarget.value) }} required={true} />


      </div>


    </div>
    <div className=' flex flex-col items-end'>

      <div><ReactButton modClasses={["ghost", "caution", "sm"]} label="Delete" icon={<TrashIcon className='w-4 h-4 text-caution' />}></ReactButton></div>
      {currentlyEditing&&<div>asdfasf</div>}

    </div>
  </li>
}
