import { useSortable } from '@dnd-kit/react/sortable';
import { type TSampleImage } from '@/actions/settings/schema';

import { useMemo, useState,type Dispatch,type SetStateAction }  from 'react';
import ReactButton from '@/components/Button/ReactButton';

type TProps = {
  index: number,
  image: TSampleImage,
  editingImage: null | number,
  updateAltText: (id: number, text: string) => void,
  deleteImage: (id:number) =>void
}
export default function SampleItem(props: TProps) {
  const [testValue,updateTestValue] = useState("asdfa asdf asdf")
  const { index, image ,editingImage,updateAltText,deleteImage} = props;
  const { ref, handleRef } = useSortable({ id: image.id, index });

  return <li className='border border-dashed border-foreground p-2 flex items-start bg-background' ref={ref}>
    <div className='cursor-grab' ref={handleRef}style={{visibility:editingImage!==null?"hidden":undefined}}>
      <span className='icon-[carbon--draggable] w-6 h-6' />
    </div>
    <div className='w-32 ml-2'>
      <img src={image.url } />
    </div>
    <div className='flex-1 ml-2 '>
      <div className='font-bold'>Alt text (required):</div>
      <div className='flex items-center'>
        <input
          className={`border ${!image.altText?"border-caution":"border-foreground"} p-1 flex-1 `}
          value={image.altText || ""} onChange={(e) => { updateAltText(image.id, e.currentTarget.value) }} required={true} />
      </div>
      <div><ReactButton onClick={() => {deleteImage(image.id) }} modClasses={["ghost", "caution", "sm"]} label="Delete" icon={<span className='w-4 h-4 text-caution icon-[carbon--trash-can]' />}></ReactButton></div>


    </div>

  </li>
}
