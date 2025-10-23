import { useState } from "react"
import BlockEditor from "../../_adminComponents/BlockEditor/BlockEditor"
import type { Block } from "@blocknote/core";

export default function AboutForm({aboutText}:{aboutText:Block[]}) {
  const [text,updateText] = useState(aboutText); 

  return <form className="max-w-screen-lg">
    <BlockEditor initialContent={aboutText}/>
  
  
  </form>
}