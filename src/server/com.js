const { component, useState, useEffect } = require("nimm-react");
const {
  useOpenStream,
  useMessageStream,
  useMarkedImages,
  useUserImages,
  useStateImages,
} = require("./hooks");

if (process.argv.indexOf("--nobrowser") == -1)
  var browser = require("../browser");

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
  return [
    component(setImages),
    //component(stripImagesForUsers, { datetime })
    //component(stripImagesForUsers, {users, setImages, setUsers, model, datetime, updateNewImages, setNewimages})
  ];
};

function setImages() {
  const [currentUsername] = useOpenStream('current-username');
  const [currentState] = useOpenStream('current-state');
  const [showOptions] = useOpenStream('show-options');

  console.log(`username:${currentUsername}, state:${currentState}`);

  if (currentUsername == "__NEW_IMAGES__") return component(setImages_new);
  else if (currentUsername == "__MARKED_IMAGES__")
    return component(setImages_marked);
  else if (currentUsername == null && currentState)
    return component(setImages_state, { currentState });
  else if (currentUsername != null)
    return component(setImages_user, { currentUsername, showOptions });
}

function setImages_new() {
  const [ newImages ] = useOpenStream('new-images');
  const { set } = useMessageStream('images');

  set(newImages||[]);
}
function setImages_marked() {
  const  markedImages = useMarkedImages();
  const { set } = useMessageStream('images');

  set(markedImages || []);
}
function setImages_state({ currentState }) {
  const stateImages = useStateImages(currentState);
  const { set } = useMessageStream('images');

  useEffect(() => {
    set(stateImages || []);
  }, [currentState, stateImages]);
}
function setImages_user({ currentUsername, showOptions }) {
  const userImages = useUserImages(currentUsername);
  const { set } = useMessageStream('images');

  useEffect(() => {
    set(userImages || []);
  }, [currentUsername, userImages]);
}

function stripImagesForUsers({ datetime }) {
  if (process.argv.indexOf("--nobrowser") > -1) return;

  const [ran, setRan] = useState([]);
  const [running, setRunning] = useState(null);
  const { currentUsername } = useCurrentUsername();
  const { users } = useUsers();

  if (!users) return;

  if (!running) {
    if (currentUsername)
      var currentuser = users.find(x => x.username == currentUsername);

    var userstorun = [
      ...(currentuser ? [currentuser] : []),
      ...users
    ].nimmunique(ran, "username");

    var [user] = userstorun;
    if (!user) {
      console.log("ALL USERS RAN");
      return;
    }
    setRunning(user);
  }

  if (!running) return;

  return component(getImagesRunner, {
    setRunning,
    setRan,
    timeIndex: datetime,
    ...running
  });
}
var c = 0;
function getImagesRunner({ setRunning, setRan, timeIndex, ...user }) {
  const imageIds = useImageIds(user.username);
  const [, { updateUser }] = useUsers();
  const [, { pushNewImages }] = useNewImages();

  if (!imageIds) return;

  useEffect(() => {
    let userimages = imageIds.map(x => {
      return { id: x };
    });

    browser
      .getImages(
        user.url.replace(/\/$/, "") + "/gallery/?catpath=/",
        true,
        userimages,
        imgs => {
          var newimages = imgs.nimmunique(userimages, "id");
          newimages.forEach(x => {
            x.username = user.username;
            x.seen = false;
            x.datetime = timeIndex;
          });

          userimages.push(...newimages);

          updateUser(user.username, { imgcount: userimages.length });
          pushNewImages(newimages);
        }
      )
      .then(() => {
        updateUser(user.username, {
          reachedBottom: true,
          lastUpdated: timeIndex
        });
        setRan(ran => [...ran, user]);
        setRunning(null);
      });
  }, userimages);
}
