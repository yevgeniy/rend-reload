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
  Drawer
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
import MarkSelection from "./MarkSelection";

const useStyles = makeStyles(theme => {
  return {
    root: {},
    marking: {
      cursor: "pointer"
    },
    images: {
      display: "flex",
      flexWrap: "wrap",
      paddingTop: "70px"
    }
  };
});

const SelectedUserPage = props => {
  const classes = useStyles();
  const [currentUsername, { set: setCurrentUsername }] = useOpenStream(
    "current-username"
  );
  const brockenImages = useRef({});
  useEffect(() => {
    props.match.params.username &&
      setCurrentUsername(props.match.params.username);
    return () => setCurrentUsername(null);
  }, []);
  const [
    isMarkSelectionOpen,
    openMarkSelection,
    doneMarkSelection
  ] = useModal();

  const [selectedState, { set: setCurrentState }] = useOpenStream(
    "current-state"
  );
  useEffect(() => {
    props.match.params.state && setCurrentState(+props.match.params.state);
    return () => setCurrentState(null);
  }, []);

  let imageids = useImageIds();

  const { scrollTop, screenHeight } = useScrolling();

  const [selectedImage, setSelectedImage] = useState(null);
  const marking = useM(!selectedImage);

  if (currentUsername !== "__NEW_IMAGES__")
    imageids && (imageids = [...imageids].sort((a, b) => (a >= b ? 1 : -1)));

  return (
    <div
      className={clsx(classes.root, {
        [classes.marking]: marking
      })}
    >
      {!selectedImage && (
        <>
          <UserHeader
            brockenImages={brockenImages}
            username={currentUsername}
            openMarkSelection={openMarkSelection}
          />
          <StateHeader
            brockenImages={brockenImages}
            selectedState={selectedState}
            openMarkSelection={openMarkSelection}
          />
        </>
      )}

      <div className={classes.images}>
        {(imageids || []).map((v, i) => {
          return (
            <ImageItem
              brockenImages={brockenImages}
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
      <Drawer
        open={isMarkSelectionOpen}
        anchor="right"
        onClose={doneMarkSelection}
      >
        <MarkSelection
          doneMarkSelection={doneMarkSelection}
          setSelectedImage={setSelectedImage}
        />
      </Drawer>
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
const UserHeader = React.memo(
  ({ username, openMarkSelection, brockenImages }) => {
    if (!username) return null;
    const classes = useHeaderStyles();
    const { send, request } = useMessageStream("users");
    const { send: send_images, request: request_images } = useMessageStream(
      "images"
    );
    const { on: on_image } = useMessageStream("image");

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
      await request_images("delete");
      send_images("reload");
    };
    const doDeleteUnmarkedImages = async () => {
      await confirmDeleteUnmarked();
      await request_images("delete-unmarked", username);
      send_images("reload");
    };
    const doDeleteBrockenImages = async () => {
      const brocken = Object.keys(brockenImages.current);
      console.log("a", brocken);

      await request_images(
        "delete",
        Object.keys(brockenImages.current).map(v => +v)
      );
      send_images("reload");
    };

    return (
      <>
        <AppBar className={classes.root} position="fixed">
          <Toolbar>
            <Typography className="username" variant="h6">
              {username}
            </Typography>
            <Button onClick={openMarkSelection}>open mark</Button>

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
              <Button
                variant="contained"
                className={classes.button}
                onClick={doDeleteBrockenImages}
              >
                Delete Brocken Images
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
  }
);
const StateHeader = React.memo(
  ({ selectedState, openMarkSelection, brockenImages }) => {
    if (!selectedState) return null;
    return (
      <AppBar position="fixed">
        <Toolbar>
          <Typography variant="h6">{selectedState}</Typography>
          <Button onClick={openMarkSelection}>open mark</Button>
        </Toolbar>
      </AppBar>
    );
  }
);

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
function useM(isActive) {
  const [marking, setMarking] = useState(false);
  useEffect(() => {
    if (!isActive) return;
    var onM = e => {
      if (e.key == "m") setMarking(marking => !marking);
    };
    document.addEventListener("keyup", onM);
    return () => {
      document.removeEventListener("keyup", onM);
    };
  }, [isActive]);

  return marking;
}
function useImageIds() {
  const { watch, request } = useMessageStream("images");
  const [imageids, setimageids] = useState([]);

  useEffect(() => {
    request("getImageIds").then(v => setimageids(v));
  }, []);

  watch("set", () => request("getImageIds").then(v => setimageids(v)));

  return imageids;
}

export default SelectedUserPage;
