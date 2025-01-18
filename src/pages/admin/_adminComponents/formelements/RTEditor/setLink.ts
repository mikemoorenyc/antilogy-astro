import type { Editor } from "@tiptap/react";


export default function setLink(editor:Editor,breakLink?:boolean) {
 const previousUrl = editor.getAttributes('link').href
    if(breakLink) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return ;
    }
    const url = window.prompt('URL', previousUrl)

    // cancelled
    if (url === null) {
        return
    }

    // empty
    if (url === '') {
        editor.chain().focus().extendMarkRange('link').unsetLink().run()

        return
    }

    // update link
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
}