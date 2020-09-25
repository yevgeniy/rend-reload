const { useState, useEffect, useResetableState } = require("nimm-react");
const { useMongoDb } = require("./hooksDb");
const { useOpenStream, useMessageStream } = require("./hooksSystem");
const { workgen } = require("../../helpers");

function useReload() {
  const [t, sett] = useState(+new Date());
  const { on } = useMessageStream("images");
  on("reload", () => sett(+new Date()));

  return t;
}

function useMarkedImages() {
  const db = useMongoDb();
  const [markedImages, setMarkedImages] = useState(null);

  useEffect(() => {
    if (!db) return;

    new Promise(res =>
      db
        .collection("images")
        .find({ marked: true })
        .toArray((err, imgs) => res([err, imgs]))
    ).then(([err, imgs]) => {
      if (err) {
        console.log(err);
        return;
      }
      setMarkedImages(imgs);
    });
  }, [db]);

  return markedImages;
}
function useStateImages(currentState) {
  const db = useMongoDb();
  let [stateImages, setStateImages] = useState(null);

  useEffect(() => {
    if (!db) return;
    if (!currentState) {
      setStateImages(null);
      return;
    }

    new Promise(res =>
      db
        .collection("images")
        .find({ datetime: +currentState })
        .toArray((err, imgs) => res([err, imgs]))
    ).then(([err, imgs]) => {
      if (err) {
        console.log(err);
        return;
      }
      setStateImages(imgs);
    });
    return () => {
      setStateImages = () => {}; /*bork stale updates*/
    };
  }, [db, currentState]);

  return stateImages;
}
function useUserImages(currentUserName) {
  const db = useMongoDb();
  const reloadToken = useReload();
  let [userImages, setUserImages] = useResetableState(null, [
    currentUserName,
    reloadToken
  ]);
  const [newImages] = useOpenStream("new-images");

  /*first get images from database*/
  useEffect(() => {
    if (!db) return;
    if (!currentUserName) return;
    if (!!userImages) return;

    const g = workgen(function*() {
      const [err, res] = yield new Promise(res =>
        db
          .collection("images")
          .find({ username: currentUserName })
          .toArray((err, imgs) => res([err, imgs]))
      );

      if (err) {
        console.log(err);
        return;
      }
      setUserImages(res);
    });

    return () => {
      g.kill();
    };
  }, [userImages, db, currentUserName]);

  /*after images were fetched from the database, add to the images when new images are present*/
  useEffect(() => {
    if (!userImages) return;

    setUserImages(userImages => {
      return [
        ...userImages,
        ...(newImages || []).filter(v => v.username === currentUserName)
      ].nimmdistinct("thumb");
    });
  }, [!!userImages, currentUserName, newImages && newImages.length]);

  return userImages;
}
function useImageIds(username) {
  const db = useMongoDb();
  const [ids, setIds] = useState(null);

  useEffect(() => {
    if (!db) return;

    db.collection("images").distinct("id", { username }, (err, ids) =>
      setIds(ids || [])
    );
  }, [db, username]);

  return ids;
}

module.exports = {
  useMarkedImages,
  useStateImages,
  useUserImages,
  useImageIds,
  useReload
};
