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
  Divider
} from "@material-ui/core";
import { useOpenStream, useMessageStream } from "./hooks";
import ImageItem from "./ImageItem";
import FramedImage from "./FramedImage";

const useStyles = makeStyles(theme => {
  return {
    root: {},
    marking: {
      cursor: "pointer"
    },
    images: {
      display: "flex",
      flexWrap: "wrap"
    }
  };
});

const SelectedUserPage = props => {
  const classes = useStyles();
  const [currentUsername, { set: setCurrentUsername }] = useOpenStream(
    "current-username"
  );
  useEffect(() => {
    props.match.params.username &&
      setCurrentUsername(props.match.params.username);
    return () => setCurrentUsername(null);
  }, []);

  const [user] = useOpenStream("user", currentUsername);

  const [selectedState, { set: setCurrentState }] = useOpenStream(
    "current-state"
  );
  useEffect(() => {
    props.match.params.state && setCurrentState(+props.match.params.state);
    return () => setCurrentState(null);
  }, []);

  let [imageids, setimageids] = useState([]);
  const { watch: imagesWatch, request: imagesRequest } = useMessageStream(
    "images"
  );

  imagesWatch("set", () => {
    imagesRequest("getImageIds").then(setimageids);
  });

  const { scrollTop, screenHeight } = useScrolling();
  const marking = useM();

  const [selectedImage, setSelectedImage] = useState(null);

  console.log(imageids);
  if (currentUsername !== "__NEW_IMAGES__")
    imageids && (imageids = [...imageids].sort((a, b) => (a >= b ? 1 : -1)));

  return (
    <div
      className={clsx(classes.root, {
        [classes.marking]: marking
      })}
    >
      <UserHeader username={currentUsername} />
      <StateHeader selectedState={selectedState} />

      <div className={classes.images}>
        {(imageids || []).map((v, i) => {
          return (
            <ImageItem
              key={i}
              i={i}
              scrollTop={scrollTop}
              screenHeight={screenHeight}
              setSelectedImage={setSelectedImage}
              marking={marking}
              id={v}
            />
          );
        })}
      </div>

      {selectedImage && (
        <FramedImage id={selectedImage} setSelectedImage={setSelectedImage} />
      )}
    </div>
  );
};
function useDropUserConfirm() {
  const [isShowConfirm, setIsShow] = useState(false);
  const prom = useRef();

  const dropUserConfirm = () => {
    return new Promise(res => {
      prom.current = res;
      setIsShow(true);
    });
  };
  const doConfirm = () => {
    prom.current && prom.current();
    setIsShow(false);
  };
  const dontConfirm = () => {
    prom.current = null;
    setIsShow(false);
  };

  return {
    isShowConfirm,
    dropUserConfirm,
    doConfirm,
    dontConfirm
  };
}
const useHeaderStyles = makeStyles(theme => ({
  root: {},
  button: {
    marginLeft: theme.spacing(2)
  },
  controls: {
    display: "flex",
    flex: 1,
    justifyContent: "flex-end"
  },
  dialog: {
    padding: theme.spacing(2)
  }
}));
const UserHeader = React.memo(({ username }) => {
  if (!username) return null;
  const classes = useHeaderStyles();
  const { send } = useMessageStream("users");
  const {
    isShowConfirm,
    dropUserConfirm,
    doConfirm,
    dontConfirm
  } = useDropUserConfirm();
  const doDropUser = () => {
    dropUserConfirm().then(() => {
      send("delete", username);
    });
  };
  const doGetImages = () => {
    send("strip-images", username);
  };
  return (
    <>
      <AppBar className={classes.root} position="static">
        <Toolbar>
          <Typography variant="h6">{username}</Typography>

          <div className={classes.controls}>
            <Button
              variant="contained"
              className={classes.button}
              onClick={doDropUser}
            >
              Drop User
            </Button>
            <Button
              variant="contained"
              className={classes.button}
              onClick={doGetImages}
            >
              Get Images
            </Button>
          </div>
        </Toolbar>
      </AppBar>
      {isShowConfirm && (
        <Dialog
          classes={{ paper: classes.dialog }}
          open={isShowConfirm}
          onClose={dontConfirm}
        >
          <DialogTitle>Delete User?</DialogTitle>

          <div>
            <Button variant="outlined" color="primary" onClick={doConfirm}>
              Confirm
            </Button>
            <Button href="#" onClick={dontConfirm}>
              Cancel
            </Button>
          </div>
        </Dialog>
      )}
    </>
  );
});
const StateHeader = React.memo(({ selectedState }) => {
  if (!selectedState) return null;
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6">{selectedState}</Typography>
      </Toolbar>
    </AppBar>
  );
});

function useScrolling() {
  const [scrollTop, setScrollTop] = useState(0);
  const [screenHeight, setScreenHeight] = useState(window.innerHeight);

  useEffect(() => {
    let t;
    const onscroll = () => {
      clearTimeout(t);
      t = setTimeout(() => {
        setScrollTop(document.scrollingElement.scrollTop);
        setScreenHeight(window.innerHeight);
      }, 100);
    };
    document.addEventListener("scroll", onscroll);
    onscroll();
    return () => {
      document.removeEventListener("scroll", onscroll);
    };
  }, []);

  return { scrollTop, screenHeight };
}
function useM() {
  const [marking, setMarking] = useState(false);
  useEffect(() => {
    var onM = e => {
      if (e.key == "m") setMarking(!marking);
    };
    document.addEventListener("keyup", onM);
    return () => {
      document.removeEventListener("keyup", onM);
    };
  });

  return marking;
}

export default SelectedUserPage;
