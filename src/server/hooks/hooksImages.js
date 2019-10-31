const { useState, useEffect } = require("nimm-react");
const { useMongoDb } = require("./hooksDb");

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

  return { markedImages };
}
function useStateImages(currentState) {
  const db = useMongoDb();
  const [stateImages, setStateImages] = useState(null);

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
    return ()=> {
      setStateImages=()=>{} /*bork stale updates*/
    }
  }, [db, currentState]);

  return { stateImages };
}
function useUserImages(currentUserName) {
  const db = useMongoDb();
  let [userImages, setUserImages] = useState(null);

  useEffect(() => {
    if (!db) return;
    if (!currentUserName) {
      setUserImages(null);
      return;
    }

    new Promise(res =>
      db
        .collection("images")
        .find({ username: currentUserName })
        .toArray((err, imgs) => res([err, imgs]))
    ).then(([err, res]) => {
      if (err) {
        console.log(err);
        return;
      }
      setUserImages(res);
    });
    return ()=> {
      setUserImages=()=>{} /*bork stale updates*/
    }
  }, [db, currentUserName]);

  return { userImages };
}

module.exports = {
  useMarkedImages,
  useStateImages,
  useUserImages
};
