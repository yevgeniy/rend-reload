import { useState, useEffect, useCallback } from "react";
import { useModel } from "./";

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
export function useImage(_img) {
  const [image, syncModel] = useModel(
    model => model.images.find(v => v && _img && v.id === _img.id),
    _img
  );

  const updateImage = useCallback(
    update => {
      if (!image) return;
      syncModel(sync => {
        for (let i in update) sync(image).alter(i, update[i]);
      });
    },
    [_img && _img.id]
  );

  return { image, updateImage };
}
