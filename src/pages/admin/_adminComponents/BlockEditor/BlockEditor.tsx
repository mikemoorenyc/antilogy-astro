
import type { Block } from "@blocknote/core";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import { useCreateBlockNote } from "@blocknote/react";
import "./styles.css"
 
export default function BlockEditor({initialContent}:{initialContent:Block[]}) {
  // Creates a new editor instance.
  const editor = useCreateBlockNote({
    initialContent:initialContent.length ? initialContent : undefined
  });
 
  // Renders the editor instance using a React component.
  return <BlockNoteView editor={editor} theme={"light"}/>;
}