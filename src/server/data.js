const {
  component,
  useState,
  useEffect,
  useResetableState,
  useRef
} = require("nimm-react");
const {
  useMongoDb,
  useOpenStream,
  useMessageStream,
  useStream
} = require("./hooks");

module.exports = function({ datetime }) {
  const db = useMongoDb();
  if (!db) return;

  return [
    component(loadUsers, { db }),
    component(loadStates, { db }),
    component(updateImage, { db }),
    component(saveNewImages, { db })
    // component(updateUser, { db })
  ];
};

function updateImage({ db }) {
  const { on } = useMessageStream("image");
  on("update", async request => {
    let [updates] = request.args;
    let id = request.at;
    await db.collection("images").updateOne({ id }, { $set: updates });
    return true;
  });
}
function saveNewImages({ db }) {
  const { on } = useMessageStream("new-images");
  on("add", async newimages => {
    await Promise.all(
      newimages.map(v => {
        console.log("NEW IMG", v);
        if (v && v.id && v.thumb && v.reg && v.datetime) {
          console.log("SAVING", v.id);
          return db.collection("images").insertOne(v);
        }

        return Promise.resolve();
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
  const { set } = useMessageStream("states");

  useEffect(() => {
    db.collection("images").distinct("datetime", (err, times) => set(times));
  }, []);
}

function loadUsers({ db }) {
  const { set } = useMessageStream("users");

  useEffect(() => {
    db.collection("users")
      .find({})
      .toArray((err, users) => {
        err && console.log(err);
        console.log("LOADED USERS");
        set(users);
      });
  }, []);
}
