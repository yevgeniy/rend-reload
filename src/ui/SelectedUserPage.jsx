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
import {
  useOpenStream,
  useMessageStream,
  useModal,
  useUser,
  useUsers
} from "./hooks";
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

  const [user] = useUser(currentUsername);

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
  },
  dialogControls: {
    display: "flex",
    justifyContent: "center"
  }
}));
const UserHeader = React.memo(({ username }) => {
  if (!username) return null;
  const classes = useHeaderStyles();
  const { send, request } = useMessageStream("users");
  const { send: send_images, request: request_images } = useMessageStream(
    "images"
  );
  const [
    isShowConfirmKill,
    confirmKill,
    doConfirmKill,
    dontConfirmKill
  ] = useModal();
  const [
    isShowConfirmDeleteImages,
    confirmDeleteImages,
    doConfirmDeleteImages,
    dontConfirmDeleteImages
  ] = useModal();
  const [
    isShowConfirmDeleteUnmarked,
    confirmDeleteUnmarked,
    doConfirmDeleteUnmarked,
    dontConfirmDeleteUnmarked
  ] = useModal();
  const doDropUser = () => {
    confirmKill().then(() => {
      send("delete", username);
    });
  };
  const doGetImages = () => {
    send("strip-images", username);
  };
  const doDeleteImages = async () => {
    await confirmDeleteImages();
    await request_images("delete", username);
    send_images("reload");
  };
  const doDeleteUnmarkedImages = async () => {
    await confirmDeleteUnmarked();
    await request_images("delete-unmarked", username);
    send_images("reload");
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
            <Button
              variant="contained"
              className={classes.button}
              onClick={doDeleteImages}
            >
              Delete Images
            </Button>
            <Button
              variant="contained"
              className={classes.button}
              onClick={doDeleteUnmarkedImages}
            >
              Delete Unmarked Images
            </Button>
          </div>
        </Toolbar>
      </AppBar>
      <Dialog
        classes={{ paper: classes.dialog }}
        open={isShowConfirmKill}
        onClose={dontConfirmKill}
      >
        <DialogTitle>Delete User?</DialogTitle>

        <div className={classes.dialogControls}>
          <Button variant="outlined" color="primary" onClick={doConfirmKill}>
            Confirm
          </Button>
          <Button onClick={dontConfirmKill}>Cancel</Button>
        </div>
      </Dialog>

      <Dialog
        classes={{ paper: classes.dialog }}
        open={isShowConfirmDeleteImages}
        onClose={dontConfirmDeleteImages}
      >
        <DialogTitle>Delete All Images for User?</DialogTitle>

        <div className={classes.dialogControls}>
          <Button
            variant="outlined"
            color="primary"
            onClick={doConfirmDeleteImages}
          >
            Confirm
          </Button>
          <Button onClick={dontConfirmDeleteImages}>Cancel</Button>
        </div>
      </Dialog>
      <Dialog
        classes={{ paper: classes.dialog }}
        open={isShowConfirmDeleteUnmarked}
        onClose={dontConfirmDeleteUnmarked}
      >
        <DialogTitle>Delete Unmakred Images for User?</DialogTitle>

        <div className={classes.dialogControls}>
          <Button
            variant="outlined"
            color="primary"
            onClick={doConfirmDeleteUnmarked}
          >
            Confirm
          </Button>
          <Button onClick={dontConfirmDeleteUnmarked}>Cancel</Button>
        </div>
      </Dialog>
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
