import { defaultProps } from "@blocknote/core";
import { createReactBlockSpec } from "@blocknote/react";
import UploadImage from "../formelements/UploadImage";
import BlockUploadContext from "./BlockUploadContext";


const UploadBlock = (props) => {
  const {updateImageFile} = BlockUploadContext; 

  const fileUpdate = (file:File) => {
    updateImageFile(
      file, props.block.id
    )

  }
  return <div >
    <UploadImage
      uploadedImage={props.block.props.imageUrl}
      
      
      />

    <div className="image-caption " ref={props.contentRef}/>
  
  
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
