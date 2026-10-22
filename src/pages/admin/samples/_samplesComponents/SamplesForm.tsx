import React, { useState } from "react";
import { SampleImage, type TSampleSettings } from "@/actions/settings/schema";
import SampleItem from "./SampleItem";
import {DragDropProvider} from '@dnd-kit/react';
import {move} from '@dnd-kit/helpers';
export default function (props: TSampleSettings) {
  const { pageTitle, sampleImages, pageIntro } = props;
  const [editingImage,updateEditingImage] = useState<null|number>(null)
  const [images, updateImages] = useState([{
    id: 345,
    url: "item 1"
  }, {
    id: 363,
    url:"item 2"
    },
    {id:566,url:"item 3"}
   ]);
  return <form className="max-w-screen-lg" onSubmit={(e)=>{e.preventDefault()}}>
    <div className="border border-foreground p-4 mb-4 overflow-hidden">
      <DragDropProvider onDragOver={(event) => {
              updateImages((items) => move(items, event));
            }}>
      <ul>
        {images.map((image, index) => {
          return <SampleItem  key={image.id} {...{index,image,updateEditingImage,editingImage}} ></SampleItem>
        })}
        </ul>
      </DragDropProvider>

    </div>
    <div>{JSON.stringify(images) }</div>
  </form>
}
