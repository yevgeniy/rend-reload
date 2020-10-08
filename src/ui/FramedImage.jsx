import React, { useState, useEffect, useRef } from "react";
import {
  makeStyles,
  AppBar,
  Toolbar,
  Button,
  Divider,
  Chip,
  TextField
} from "@material-ui/core";
import orange from "@material-ui/core/colors/orange";
import green from "@material-ui/core/colors/green";
import purple from "@material-ui/core/colors/purple";
import Autocomplete from "@material-ui/lab/Autocomplete";

import { useOpenStream, useMessageStream } from "./hooks";
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
    keywords: {
      padding: theme.spacing(),
      fontSize: ".8em"
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
      paddingTop: "130px",
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
  const [img, { send, update: updateImage }] = useOpenStream("image", id);
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

  useEffect(() => {
    if (!img) return;

    if (!img.reg) send("get-reg");
  }, [img && img.id, img && img.reg]);

  const close = () => setSelectedImage(null);
  const mark = () => updateImage({ marked: !img.marked });
  const drawn = () => updateImage({ drawn: !img.drawn });
  const drawing = () => updateImage({ drawing: !img.drawing });

  if (!img) return null;
  return (
    <div className={classes.root}>
      <div className={classes.background} onClick={close} />

      <div className={classes.imgSetting} ref={settingNodeRef}>
        <img src={img.reg || img.thumb} style={{ opacity: 1 }} ref={imgRef} />
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
        <Divider />
        <div className={classes.keywords}>
          <AutocompleteSection
            updateImage={updateImage}
            keywords={img.keywords}
          />
        </div>
      </AppBar>
    </div>
  );
});

const useAutocompleteStyles = makeStyles(
  theme => ({
    root: { padding: 0, width: "100%", color: "white" },
    inputRoot: { padding: "0 !important" },
    endAdornment: { display: "none" },
    input: { color: "white !important" }
  }),
  { name: "autocomplete-overrides" }
);
const useAutocompleteChipStyles = makeStyles(
  theme => ({
    root: {
      color: "white",
      borderColor: "white",
      height: "25px"
    },
    deleteIcon: {
      color: "white",
      marginRight: "1px !important"
    }
  }),
  { name: "autocomplete-chip-overrides" }
);

const AutocompleteSection = ({ keywords, updateImage }) => {
  const ref = useRef({});
  const autoCompleteClasses = useAutocompleteStyles({});
  const autoCompleteChipClasses = useAutocompleteChipStyles({});
  const [allKeywords, { set: set_allKeyWords }] = useOpenStream(
    "all-key-words"
  );

  const update = e => {
    setTimeout(() => {
      //@ts-ignore
      let kw = [...ref.current.querySelectorAll(".MuiChip-label")].map(
        v => v.innerHTML
      );
      kw = Array.from(new Set(kw || []));
      kw = kw.filter(v => v).map(v => v.toLowerCase());

      console.log(kw, allKeywords);
      updateImage({ keywords: kw || [] });
      set_allKeyWords(Array.from(new Set([...allKeywords, ...kw])));
    });
  };

  console.log(allKeywords);
  return (
    <Autocomplete
      ref={ref}
      classes={autoCompleteClasses}
      multiple
      id="tags-filled"
      options={(allKeywords || [])
        .filter(v => v)
        .filter(v => !(keywords || []).some(z => z === v))}
      defaultValue={keywords || []}
      onChange={update}
      freeSolo
      renderTags={(value, getTagProps) =>
        value.map((option, index) => (
          <Chip
            classes={autoCompleteChipClasses}
            variant="outlined"
            label={option}
            {...getTagProps({ index })}
          />
        ))
      }
      renderInput={params => {
        return (
          <TextField
            {...params}
            classes={{ root: { color: "white !important" } }}
            placeholder="-- ADD KEYWORD --"
            fullWidth
          />
        );
      }}
    />
  );
};

export default FramedImage;
