const { component, useState, useEffect } = require("nimm-react");
const {
  useOpenStream,
  useMessageStream,
  useReload,
  useMongoDb
} = require("./hooks");

const { workgen } = require("../helpers");

function setUserImages() {
  const [currentUsername] = useOpenStream("current-username");
  const [currentState] = useOpenStream("current-state");

  console.log(`username:${currentUsername}, state:${currentState}`);

  if (!currentUsername) return;
  if (currentUsername === "__NEW_IMAGES__") return;
  if (currentUsername === "__MARKED_IMAGES__") return;

  return component(setImages, { currentUsername });
}

function setImages({ currentUsername }) {
  const userImages = useUserImages(currentUsername);
  const { set } = useMessageStream("images");

  useEffect(() => {
    console.log("setting images", userImages && userImages.length);
    set(userImages || []);
  }, [currentUsername, userImages]);
}

function useUserImages(currentUserName) {
  const db = useMongoDb();
  const reloadToken = useReload();
  const [dbimages, setdbimages] = useState(null);
  const [newImages] = useOpenStream("new-images");

  /*first get images from database*/
  useEffect(() => {
    if (!db) return;
    if (!currentUserName) return;

    const g = workgen(function*() {
      const res = yield db
        .collection("images")
        .find({ username: currentUserName })
        .toArray();

      setdbimages(res);
    });

    return () => {
      g.kill();
    };
  }, [reloadToken, db, currentUserName]);

  /*after images were fetched from the database, add to the images when new images are present*/
  return [
    ...(dbimages || []),
    ...(newImages || []).filter(v => v.username === currentUserName)
  ].nimmdistinct("id");
}

module.exports = setUserImages;
