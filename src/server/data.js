const {
  component,
  useState,
  useEffect,
  useResetableState,
  useRef
} = require("nimm-react");
const {
  useImageUpdates,
  useMongoDb,
  useUsers,
  useStates,
  userNewImageUpdates,
  useUserUpdates
} = require("./hooks");

module.exports = function({ datetime }) {
  const db = useMongoDb();
  if (!db) return;

  return [
    component(loadUsers, { db }),
    component(loadStates, { db }),
    component(updateImage, { db })
    // component(saveNewImages, { db }),
    // component(updateUser, { db })
  ];
};

function updateImage({ db }) {
  useImageUpdates(async (id, updates) => {
    await db.collection("images").updateOne({ id }, { $set: updates });
    return true;
  });
}
function saveNewImages({ db }) {
  userNewImageUpdates(async newimages => {
    console.log(`NEW IMAGES: ${newimages[0].username}, ${newimgs.length}`);

    await Promise.all(
      newimages.map(v => {
        return db.collection("images").insertOne(v);
      })
    );
    return true;
  });
}

function updateUser({ db }) {
  useUserUpdates(async (username, updates) => {
    await db
      .collection("users")
      .updateOne({ username }, { $set: updates }, err => {
        if (err) {
          console.log(err);
          return;
        }
        console.log(`UPDATED USER: ${username}`);
      });
    return true;
  });
}

function loadStates({ db }) {
  const { setStates } = useStates();

  useEffect(() => {
    db.collection("images").distinct("datetime", (err, times) =>
      setStates(times)
    );
  }, []);
}

function loadUsers({ db }) {
  const { setUsers } = useUsers();

  useEffect(() => {
    db.collection("users")
      .find({})
      .toArray((err, users) => {
        err && console.log(err);
        console.log("LOADED USERS");
        setUsers(users);
      });
  }, []);
}
