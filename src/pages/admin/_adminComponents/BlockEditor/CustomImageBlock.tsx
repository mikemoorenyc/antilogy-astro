import { defaultProps } from "@blocknote/core";
import { createReactBlockSpec } from "@blocknote/react";
import UploadImage from "../formelements/UploadImage";
import BlockUploadContext from "./BlockUploadContext";


const UploadBlock = (props) => {
  return <div >
    <UploadImage />
  
  
  </div>


}


export default const CustomImageBlock = createReactBlockSpec(
  {
    type: "customImage",
    propSchema: {
      textAlignment: defaultProps.textAlignment,
      textColor: defaultProps.textColor,
      imageUrl: {
        type:"string"
      },
    },
    content: "inline",
  },
  {
    render: UploadBlock
  }
)
