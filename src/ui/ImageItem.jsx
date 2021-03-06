import React from "react";
import { useState, useEffect, useRef } from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/core";
import { useOpenStream, useMessageStream } from "./hooks";
import BrokenImage from "@material-ui/icons/BrokenImage";

const useStyles = makeStyles(
  theme => {
    return {
      root: {
        transition: "all 500ms ease",
        border: "solid #afafaf 1px",
        background: "#dfdfdf",
        marginBottom: -5,
        transition: "opacity 500ms ease"
      },
      frame: {
        height: 200,
        width: 200
      },
      drawing: {
        border: "solid blue 5px"
      },
      marked: {
        border: "solid green 5px"
      },
      noreg: {
        border: "solid red 5px"
      }
    };
  },
  { name: "ImgItem" }
);

const ImageItem = React.memo(
  ({
    scrollTop,
    screenHeight,
    setSelectedImage,
    marking,
    id,
    brockenImages
  }) => {
    const classes = useStyles();

    const nodeRef = useRef();

    const isOnScreen = useIsOnScreen({ nodeRef, screenHeight, scrollTop });

    if (isOnScreen)
      return (
        <ImageDetails
          {...{ id, setSelectedImage, marking, nodeRef, brockenImages }}
        />
      );

    return (
      <div className={clsx(classes.root, classes.frame)} ref={nodeRef}>
        <div>
          <img className="tween-all" height="200" src={null} />
        </div>
      </div>
    );
  }
);

const ImageDetails = React.memo(
  ({ id, setSelectedImage, marking, nodeRef, brockenImages }) => {
    const classes = useStyles();
    let [image, { update: updateImage }] = useOpenStream("image", id);

    image = image || {};
    const { thumb, drawing, drawn, marked, reg } = image;

    const { src, width, height, error } = useLoadImageOnScroll(thumb);

    const onSelect = () => {
      marking ? updateImage({ marked: !marked }) : setSelectedImage(id);
    };
    useEffect(() => {
      if (error === true) brockenImages.current[id] = true;
      return () => {
        delete brockenImages.current[id];
      };
    }, [error, id]);

    useEffect(() => {
      if (!src) return;
      updateImage({ seen: true });
    }, [src]);

    return (
      <div
        className={clsx(classes.root, {
          [classes.marked]: marked && reg,
          [classes.noreg]: marked && !reg,
          [classes.drawing]: drawing
        })}
        ref={nodeRef}
        data-thumb={thumb}
        onClick={onSelect}
        data-datetime={image.datetime}
        data-id={image.id}
        style={{ width, height }}
      >
        <div style={{ opacity: drawn ? 0.5 : 1 }}>
          {error === true && <BrokenImage />}
          <img
            className={clsx("tween-all", {
              loaded: !!src
            })}
            height="200"
            src={src || null}
          />
        </div>
      </div>
    );
  }
);

function useIsOnScreen({ nodeRef, screenHeight, scrollTop }) {
  const [isOnScreen, setIsOnScreen] = useState(false);

  useEffect(() => {
    var dims = nodeRef.current.getBoundingClientRect();

    if (dims.bottom >= 0 && dims.top <= screenHeight) setIsOnScreen(true);
  }, [screenHeight, scrollTop]);

  return isOnScreen;
}

function useLoadImageOnScroll(thumb) {
  const [src, setSrc] = useState(null);
  const [width, setWidth] = useState("200px");
  const [height, setHeight] = useState("200px");
  const [error, seterror] = useState(null);

  const imgRef = useRef();

  useEffect(() => {
    return () => {
      imgRef.current && (imgRef.current.src = "");
    };
  }, []);

  useEffect(() => {
    if (!thumb) return;

    imgRef.current && (imgRef.current.src = "");

    imgRef.current = new Image();
    imgRef.current.addEventListener("load", () => {
      setWidth("auto");
      setHeight("auto");
      seterror(false);
      setSrc(imgRef.current.src);
      imgRef.current.removeEventListener("error", error);
    });
    imgRef.current.addEventListener("error", error);
    function error() {
      seterror(true);
    }
    imgRef.current.src = thumb;

    return () => imgRef.current.removeEventListener("error", error);
  }, [thumb]);

  return { src, width, height, error };
}

export default ImageItem;
