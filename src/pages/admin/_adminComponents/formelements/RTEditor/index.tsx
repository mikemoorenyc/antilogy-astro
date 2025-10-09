import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import { useEffect, useState, type ReactNode } from 'react'
import { ItalicIcon, BoldIcon, ListBulletIcon,NumberedListIcon,LinkIcon,LinkSlashIcon } from '@heroicons/react/16/solid'
import setLink from './setLink'
import { createPortal } from 'react-dom'
import LinkModal from './LinkModal'

const extensions = [StarterKit.configure({
    bulletList: {
      keepMarks: true,
      keepAttributes: false, // TODO : Making this as `false` becase marks are not preserved when I try to preserve attrs, awaiting a bit of help
    },
    orderedList: {
      keepMarks: true,
      keepAttributes: false, // TODO : Making this as `false` becase marks are not preserved when I try to preserve attrs, awaiting a bit of help
    },
    
  }),
  Link.configure({
    linkOnPaste: false,
                openOnClick: false,
  }
  )]


type TEditorOption = ("bold"|"italic"|"addLink"|"removeLink"|"bulletList"|"orderedList");
type TTypeOption = [ReactNode,Function,TEditorOption];
export type TEditorOptions = TEditorOption[]; 
const availableOptions : TEditorOptions = ["bold","italic","addLink","removeLink","bulletList","orderedList"]


export default function RTEditor({content,updateCallback,options=availableOptions}:{content:string,updateCallback:(v:string)=>void,options?:TEditorOptions}) {
  const [addLinkOpen,updateAddLinkOpen] = useState(false);
  const [linkUrl,updateLinkUrl] = useState("");
  const [modalContainer,updateModalContainer] = useState<null|HTMLElement>(null);

  useEffect(()=> {
    if(window) {
      const div = document.getElementById("modal-container");
      if(div) updateModalContainer(div); 
    }
  },[])
  const editor = useEditor({
    extensions,
    content,
    immediatelyRender:false,
    onUpdate: ({ editor }) => {
  
            updateCallback(editor.getHTML());
    },

    editorProps: {
    attributes: {
      class: 'min-h-36  focus:border-action border-radius-0 outline-none text-sm py-1 px-2 border-2 border-foreground tip-tap',
    },
  }
  })
  const iconSize = {
    width: 16,
    height: 16
  }


  const typeOptions : TTypeOption[]  = editor ? [
    [<ItalicIcon style={iconSize}/>,()=>{editor.chain().focus().toggleItalic().run()},"italic"],
    [<BoldIcon style={iconSize} />, ()=>{editor.chain().focus().toggleBold().run()},"bold"],
    [<ListBulletIcon style={iconSize} />, ()=>{editor.chain().focus().toggleBulletList().run()},"bulletList"],
    [<NumberedListIcon style={iconSize} />, ()=>{editor.chain().focus().toggleOrderedList().run()},"orderedList"],
    [<LinkIcon style={iconSize}/>, () => {updateLinkUrl(editor.getAttributes("link").href);updateAddLinkOpen(true)},"addLink"],
    [<LinkSlashIcon style={iconSize} />, () => setLink(editor,true),"removeLink"]

  ] : []

const activeTest = (type:string) => {
    if(!editor) return false; 
    if(type == "removeLink") {
      return editor.getAttributes('link').href
    }
    
    return editor?.isActive(type)
  }


  return <div>
  <div className='flex mb-2'>
  {typeOptions.filter(o => {
    return options.includes(o[2])
  }).map(o => {
    let isHidden; 
    if(o[2]=="removeLink" && !editor?.getAttributes('link').href) {
      isHidden="none";
    }
    if(o[2] == "addLink" && editor?.getAttributes('link').href) {
      isHidden="none"
    }
    return (
<button 
    style={{display:isHidden}}
    className={`w-8 h-8 border flex-center-center border-foreground flex mr-2 ${activeTest(o[2])?"border-2":""} hover:border-action`}
  
    key={o[2]} 
    onClick={(e)=>{e.preventDefault();o[1]()}}
    >
    {o[0]}

  </button>


    )

  })}
  
  </div>
<EditorContent editor={editor} />


{addLinkOpen && <LinkModal isOpen={addLinkOpen} currentValue={linkUrl} closeCallback={()=>{
  updateAddLinkOpen(false);
  updateLinkUrl("")
  editor?.commands.focus();
}} saveCallback={(linkValue:string )=>{
  editor?.chain().focus().extendMarkRange('link').setLink({ href: linkValue }).run()


}}/>}
  </div>
}