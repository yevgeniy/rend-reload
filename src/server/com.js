const { component, useState, useEffect } = require("nimm-react");
const FS = require("fs");
const {
  useOpenStream,
  useMessageStream,
  useMarkedImages,
  useStateImages,
  useImageIds,
  useBrowserSystem,
  useReload
} = require("./hooks");
const stripRegUrl = require("./stripRegUrl");
const udpateUsers = require("./updateUsers");
const stripImagesForUser = require("./stripImagesForUser");
const setUserImages = require("./setUserImages");
const { workgen } = require("../helpers");

// var browser={
//     getImages:function(a,b,c,fn) {
//         const fake=[
//             {"id":985585540,"large":"https://img00.deviantart.net/928a/i/2012/048/9/c/no_title_112_by_abrito-d4q137o.jpg","reg":"https://img00.deviantart.net/928a/i/2012/048/9/c/no_title_112_by_abrito-d4q137o.jpg","thumb":"https://t00.deviantart.net/O30urEmaX9fSHWjzQU9WulXXw7U=/fit-in/700x350/filters:fixed_height(100,100):origin()/pre00/b66c/th/pre/i/2012/048/9/c/no_title_112_by_abrito-d4q137o.jpg","username":"ABrito"},
//             {"id":985585541,"large":"https://img00.deviantart.net/928a/i/2012/048/9/c/no_title_112_by_abrito-d4q137o.jpg","reg":"https://img00.deviantart.net/928a/i/2012/048/9/c/no_title_112_by_abrito-d4q137o.jpg","thumb":"https://t00.deviantart.net/O30urEmaX9fSHWjzQU9WulXXw7U=/fit-in/700x350/filters:fixed_height(100,100):origin()/pre00/b66c/th/pre/i/2012/048/9/c/no_title_112_by_abrito-d4q137o.jpg","username":"ABrito"},
//             {"id":985585542,"large":"https://img00.deviantart.net/928a/i/2012/048/9/c/no_title_112_by_abrito-d4q137o.jpg","reg":"https://img00.deviantart.net/928a/i/2012/048/9/c/no_title_112_by_abrito-d4q137o.jpg","thumb":"https://t00.deviantart.net/O30urEmaX9fSHWjzQU9WulXXw7U=/fit-in/700x350/filters:fixed_height(100,100):origin()/pre00/b66c/th/pre/i/2012/048/9/c/no_title_112_by_abrito-d4q137o.jpg","username":"ABrito"},
//             {"id":985585543,"large":"https://img00.deviantart.net/928a/i/2012/048/9/c/no_title_112_by_abrito-d4q137o.jpg","reg":"https://img00.deviantart.net/928a/i/2012/048/9/c/no_title_112_by_abrito-d4q137o.jpg","thumb":"https://t00.deviantart.net/O30urEmaX9fSHWjzQU9WulXXw7U=/fit-in/700x350/filters:fixed_height(100,100):origin()/pre00/b66c/th/pre/i/2012/048/9/c/no_title_112_by_abrito-d4q137o.jpg","username":"ABrito"},
//         ]
//         return new Promise(res=> {
//             setTimeout(()=> {
//                 fn(fake);
//                 res();
//             },2000);
//         });
//     }
// }

module.exports = function({ datetime }) {
  const [isClientConnected] = useOpenStream("is-client-connected");
  if (!isClientConnected) return null;

  return [
    component(setImages),
    component(stripRegUrl),
    component(stripImagesForUsers, { datetime }),
    component(udpateUsers),
    component(stripImagesForUser, { instanceTime: datetime }),
    component(setUserImages)
  ];
};

function setImages() {
  const [currentUsername] = useOpenStream("current-username");
  const [currentState] = useOpenStream("current-state");

  console.log(`username:${currentUsername}, state:${currentState}`);

  if (currentUsername == "__NEW_IMAGES__") return component(setImages_new);
  else if (currentUsername == "__MARKED_IMAGES__")
    return component(setImages_marked);
  else if (currentUsername == null && currentState)
    return component(setImages_state, { currentState });
}

function setImages_new() {
  const [newImages] = useOpenStream("new-images");
  const { set } = useMessageStream("images");

  set(newImages || []);
}
function setImages_marked() {
  const markedImages = useMarkedImages();
  const { set } = useMessageStream("images");

  set(markedImages || []);
}
function setImages_state({ currentState }) {
  const stateImages = useStateImages(currentState);
  const { set } = useMessageStream("images");

  useEffect(() => {
    set(stateImages || []);
  }, [currentState, stateImages]);
}

function stripImagesForUsers({ datetime }) {
  if (process.argv.indexOf("--nobrowser") > -1) return;

  const [ran, setRan] = useState([]);
  const [running, setRunning] = useState(null);
  const [currentUsername] = useOpenStream("current-username");
  const [users] = useOpenStream("users");

  useEffect(() => {
    if (!users) return;

    if (currentUsername)
      var currentuser = users.find(x => x.username == currentUsername);

    var [userToRun] = [
      ...(currentuser ? [currentuser] : []),
      ...users.filter(v => !v.dead)
    ].nimmunique(ran, "username");

    if (!userToRun) {
      console.log("ALL USERS RAN");
      //printout(out.current);
    }

    setRunning(userToRun);
  }, [users, currentUsername, ran]);

  if (!running) return;

  return component(getImagesRunner, {
    setRan,
    instanceTime: datetime,
    ...running
  });
}
var c = 0;
function getImagesRunner({ setRan, instanceTime, ...user }) {
  const imageIds = useImageIds(user.username);
  const browsersystem = useBrowserSystem();
  //const { update: updateUser } = useMessageStream("user");
  const { add: addNewImages } = useMessageStream("new-images");

  useEffect(() => {
    if (!imageIds) return;
    if (!browsersystem) return;

    const runner = browsersystem.getImagesStream(
      user.url.replace(/\/$/, "") + "/gallery/?catpath=/",
      imageIds
    );

    console.log("RUNNING", user.username);
    workgen(function*() {
      let imgs;

      while (true) {
        imgs = yield runner.read();
        if (imgs === null) break;

        var newimages = imgs.nimmunique(imageIds, (a, b) => a.id === b);
        newimages.forEach(x => {
          x.username = user.username;
          x.seen = false;
          x.datetime = instanceTime;
        });

        console.log("new", newimages.length);
        imageIds.push(...newimages.map(v => v.id));

        // updateUser(user.username, { imgcount: userimages.length });
        addNewImages(...newimages);
      }
      console.log("done", user.username);
    }).then(() => {
      // updateUser(user.username, {
      //   reachedBottom: true,
      //   lastUpdated: timeIndex
      // });
      console.log("setting ran");
      setRan(ran => [...ran, user]);
    });
  }, [imageIds, browsersystem]);
}
