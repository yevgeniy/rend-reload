const { useState, useEffect, useResetableState } = require("nimm-react");
const { useMongoDb } = require("./hooksDb");
const { useOpenStream, useMessageStream } = require("./hooksSystem");
const { workgen } = require("../../helpers");

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
  useImageIds
};
