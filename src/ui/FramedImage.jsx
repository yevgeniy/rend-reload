import React, { useState, useEffect, useRef } from "react";
import { makeStyles, AppBar, Toolbar, Button } from "@material-ui/core";
import orange from "@material-ui/core/colors/orange";
import green from "@material-ui/core/colors/green";
import purple from "@material-ui/core/colors/purple";
import { useOpenStream } from "./hooks";
import clsx from "clsx";

const useStyles = makeStyles(theme => {
  return {
    root: {
      position: "fixed",
      width: "100%",
      height: "100%",
      top: 0,
      left: 0,
      overflow: "auto"
    },
    background: {
      position: "absolute",
      background: "black",
      opacity: 0.5,
      width: "100%",
      height: "100%"
    },
    imgSetting: {
      position: "absolute",
      overflow: "auto",
      textAlign: "center",
      width: "100vw",
      height: "100vh",
      paddingTop: theme.spacing(10),
      "& img": {
        display: "inline-block"
      }
    },
    appbar: {
      position: "realtive"
    },
    button: {
      margin: theme.spacing(1)
    },
    buttonClose: {
      marginLeft: theme.spacing(10)
    },
    buttonMark: {
      color: ({ marked }) => (marked ? green[600] : "")
    },
    buttonDrawing: {
      color: ({ drawing }) => (drawing ? orange[600] : "")
    },
    buttonDrawn: {
      color: ({ drawn }) => (drawn ? purple[600] : "")
    }
  };
});

const FramedImage = React.memo(({ setSelectedImage, id }) => {
  const [img, { update: updateImage }] = useOpenStream("image", id);
  const classes = useStyles({ ...(img || {}) });

  const settingNodeRef = useRef();
  const imgRef = useRef();

  useEffect(() => {
    const repos = () => {
      if (!settingNodeRef.current) return;
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
  const mark = () => updateImage({ marked: !img.marked });
  const drawn = () => updateImage({ drawn: !img.drawn });
  const drawing = () => updateImage({ drawing: !img.drawing });

  if (!img) return null;
  return (
    <div className={classes.root}>
      <div className={classes.background} onClick={close} />

      <div className={classes.imgSetting} ref={settingNodeRef}>
        <img src={img.reg} style={{ opacity: 1 }} ref={imgRef} />
      </div>

      <AppBar className={classes.appbar}>
        <Toolbar>
          <Button
            className={clsx(classes.button, classes.buttonMark)}
            variant="outlined"
            edge="end"
            color="inherit"
            onClick={mark}
          >
            Mark
          </Button>
          <Button
            className={clsx(classes.button, classes.buttonDrawing)}
            variant="outlined"
            edge="end"
            color="inherit"
            onClick={drawing}
          >
            Drawing
          </Button>
          <Button
            className={clsx(classes.button, classes.buttonDrawn)}
            variant="outlined"
            edge="end"
            color="inherit"
            onClick={drawn}
          >
            Drawn
          </Button>
          <Button
            className={clsx(classes.button, classes.buttonClose)}
            variant="outlined"
            edge="end"
            color="inherit"
            onClick={close}
          >
            Close
          </Button>
        </Toolbar>
      </AppBar>
    </div>
  );
});

export default FramedImage;
