import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core";
import { useOpenStream } from "./hooks";

const useStyles = makeStyles(theme => {
  return {
    root: {},
    frame: {
      position: "fixed",
      width: "100%",
      height: "100%",
      top: 0,
      left: 0
    },
    background: {
      position: "absolute",
      background: "black",
      opacity: 0.3,
      width: "100%",
      height: "100%"
    },
    imgSetting: {
      position: "relative",
      overflow: "atuo"
    }
  };
});

const FramedImage = React.memo(({ setSelectedImage, id }) => {
  const classes = useStyles();

  const [img, { update: updateImage }] = useOpenStream("image", id);

  const settingNodeRef = useRef();
  const imgRef = useRef();

  useEffect(() => {
    const repos = () => {
      settingNodeRef.current.style.width = window.innerWidth + "px";
      settingNodeRef.current.style.height = window.innerHeight + "px";
    };

    window.addEventListener("resize", repos);
    repos();

    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
      window.removeEventListener("resize", repos);
    };
  }, []);

  const close = () => setSelectedImage(null);
  const mark = () => updateImage(id, { marked: !img.marked });
  const drawn = () => updateImage(id, { drawn: !img.drawn });
  const drawing = () => updateImage(id, { drawing: !img.drawing });

  return (
    <div className={classes.root}>
      <div className={classes.frame}>
        <div className={classes.background} />

        <div className={classes.imgSetting} ref={settingNodeRef}>
          <img src={img.reg} style={{ opacity: imgOpacity }} ref={imgRef} />
        </div>

        <div onClick={close} style={{ top: 0, right: 0, transform: "none" }}>
          CLOSE
        </div>
        <div
          onClick={mark}
          style={{
            top: 0,
            right: "150px",
            transform: "none",
            background: img.marked ? "green" : ""
          }}
        >
          MARK
        </div>
        <div
          className="Drawn close next"
          onClick={drawn}
          style={{
            top: 0,
            right: "300px",
            transform: "none",
            background: img.drawn ? "green" : ""
          }}
        >
          DRAWN
        </div>
        <div
          className="Drawn close next"
          onClick={drawing}
          style={{
            top: "100px",
            right: "0",
            transform: "none",
            background: img.drawing ? "green" : ""
          }}
        >
          DRAWNING
        </div>
      </div>
    </div>
  );
});

export default FramedImage;
