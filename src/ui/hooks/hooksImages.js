import { useState, useEffect, useCallback } from "react";
import { useModel, useStream } from "./";

export function useImages() {
  const [images, syncModel] = useModel(model => model.images);

  // useEffect(()=> {
  //     var a=onupdate(changes=> {
  //         if (changes.some(v=>v===System.model.images))
  //             setImages([...System.model.images])
  //     })
  //     return ()=> {
  //         a.destroy();
  //     }
  // })
  // const updateImage=(id, updateimg)=> {
  //     const img=System.model.images.find(v=>v.id===id);
  //     if (!img)
  //         return;
  //     for(let i in updateimg)
  //     sync(img).alter(i, updateimg[i]);
  //     setImages([...images]);
  // }
  return { images };
}
export function useImage(id) {
  const[image, {update}]=useStream('image', id);
  const updateImage = u=> update(u);
  
  
  return { image, updateImage };
}
