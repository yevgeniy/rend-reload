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
const deleteImages = require("./deleteImages");
const deleteUnmarked = require("./deleteUnmarkedImages");

module.exports = function({ datetime }) {
  const [isClientConnected] = useOpenStream("is-client-connected");

  if (!isClientConnected) return null;

  return component(connected);
};

function connected() {
  const db = useMongoDb();
  if (!db) return;

  return [
    component(loadUsers, { db }),
    component(dropUser, { db }),
    component(loadStates, { db }),
    component(updateImage, { db }),
    component(saveNewImages, { db }),
    component(updateUser, { db }),
    component(saveUser, { db }),
    component(deleteImages, { db }),
    component(deleteUnmarked, { db })
  ];
}

function dropUser({ db }) {
  const [users, { on, updateMember }] = useOpenStream("users");
  on("delete", async ([username]) => {
    let user = users.find(v => v.username === username);
    if (!user) return;
    await db.collection("images").deleteMany({ username });
    updateMember(username, { dead: true, imgcount: 0 });
  });
}

function updateImage({ db }) {
  const { on } = useMessageStream("image");
  on("update", async request => {
    let [updates] = request;
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
        if (v && v.id && v.thumb && v.datetime) {
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
  const { on } = useMessageStream("users");
  on("updateMember", ([username, updates]) => {
    console.log("updating", username, updates);
    db.collection("users").updateOne({ username }, { $set: updates });
  });
}
function saveUser({ db }) {
  const { on } = useMessageStream("users");
  on("add", newUsers => {
    newUsers.forEach(v => {
      console.log("ADDING USER", v);
      db.collection("users").insertOne(v);
    });
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
