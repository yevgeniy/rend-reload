import React from "react";
import { useState, useEffect, useRef } from "react";
import clsx from "clsx";
import {
  AppBar,
  Toolbar,
  Typography,
  makeStyles,
  Button,
  Dialog,
  DialogTitle,
  Drawer,
  Card,
  CardContent
} from "@material-ui/core";
import {
  useOpenStream,
  useMessageStream,
  useModal,
  useUser,
  useUsers
} from "./hooks";

const useStyles = makeStyles(
  theme => ({
    root: {
      padding: theme.spacing(),
      width: "70vw"
    },
    keyworditem: {
      marginBottom: theme.spacing(),
      "&:last-child": {
        marginBottom: 0
      }
    }
  }),
  { name: "MarkSelection" }
);

const MarkSelection = ({ setSelectedImage, doneMarkSelection }) => {
  const classes = useStyles({});
  const [allKeyWords] = useOpenStream("all-key-words");

  return (
    <div className={classes.root}>
      {(allKeyWords || []).map(keyword => (
        <KeyWordSection
          doneMarkSelection={doneMarkSelection}
          setSelectedImage={setSelectedImage}
          key={keyword}
          className={classes.keyworditem}
          keyword={keyword}
        />
      ))}
    </div>
  );
};

const useKeyWordSectionStyle = makeStyles(
  theme => ({
    root: {
      width: "100%",
      overflow: "hidden"
    },

    content: {
      display: "flex",
      flexWrap: "nowrap"
    },
    title: {
      width: "200px"
    },
    img: {
      marginRight: theme.spacing(),
      height: "100px"
    }
  }),
  { name: "KeyWordSection" }
);

const KeyWordSection = ({
  setSelectedImage,
  keyword,
  className,
  doneMarkSelection
}) => {
  const classes = useKeyWordSectionStyle({});
  const { request } = useMessageStream("images");
  const [images, setimages] = useState([]);

  useEffect(() => {
    request("get-images-by-keyword", keyword, 10).then(setimages);
  }, [keyword]);

  return (
    <div className={clsx(className, classes.root)}>
      <Card variant="outlined">
        <CardContent>
          <div className={classes.content}>
            <div className={classes.title}>
              <Typography variant="h5" component="h2">
                {keyword}
              </Typography>
            </div>
            {images.map(v => (
              <img
                onClick={() => {
                  setSelectedImage(v.id);
                  doneMarkSelection();
                }}
                className={classes.img}
                key={v.id}
                src={v.thumb}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MarkSelection;
