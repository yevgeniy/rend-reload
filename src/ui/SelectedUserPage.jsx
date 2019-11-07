import React from "react";
import { useState, useEffect } from "react";
import clsx from "clsx";
import { AppBar, Toolbar, Typography, makeStyles } from "@material-ui/core";
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

  const [imageids, setimageids] = useState([]);
  const { watch: imagesWatch, request: imagesRequest } = useMessageStream(
    "images"
  );

  imagesWatch("set", () => {
    imagesRequest("getImageIds").then(setimageids);
  });

  const { scrollTop, screenHeight } = useScrolling();
  const marking = useM();

  const [selectedImage, setSelectedImage] = useState(null);

  return (
    <div
      className={clsx(classes.root, {
        [classes.marking]: marking
      })}
    >
      <UserHeader username={user.username} />
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
const UserHeader = React.memo(({ username }) => {
  if (!username) return null;
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6">{username}</Typography>
      </Toolbar>
    </AppBar>
  );
});
const StateHeader = React.memo(({ selectedState }) => {
  if (!selectedState) return null;
  return (
    <AppBar>
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
