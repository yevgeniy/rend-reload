const { component, useState, useEffect } = require("nimm-react");
const {
  useNewImages,
  useShowOptions,
  useImages,
  useCurrentState,
  useCurrentUsername,
  useMarkedImages,
  useStateImages,
  useUserImages
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

module.exports = function({
  datetime,
  images,
  setImages,
  users,
  setUsers,
  model,
  syncUsers,
  syncImages,
  newimages,
  setNewimages,
  updateNewImages
}) {
  return [
    component(setImagesOnModel)
    //component(stripImagesForUsers, {users, setImages, setUsers, model, datetime, updateNewImages, setNewimages})
  ];
};

function setImagesOnModel() {
  const { currentUsername } = useCurrentUsername();
  const { currentState } = useCurrentState();
  const { showOptions } = useShowOptions();

console.log(currentUsername, currentState)

  useEffect(()=> {
    return ()=> {
      console.log("UNMOUNTING");
    }
  },[])

  if (currentUsername == "__NEW_IMAGES__") return component(setImages_new);
  else if (currentUsername == "__MARKED_IMAGES__")
    return component(setImages_marked);
  else if (currentUsername == null && currentState)
    return component(setImages_state, { currentState });
  else if (currentUsername != null)
    return component(setImages_user, { currentUsername, showOptions });
}

function setImages_new() {
  const { newImages } = useNewImages();
  const { setImages } = useImages();

  setImages(newImages);
}
function setImages_marked() {
  const { markedImages } = useMarkedImages();
  const { setImages } = useImages();

  useEffect(()=> {
    setImages(markedImages || []);
  },markedImages)
  
}
function setImages_state({ state }) {
  const { stateImages } = useStateImages(state);
  const { setImages } = useImages();

  useEffect(()=> {
    setImages(stateImages || []);
  },[state, stateImages])
  
}
function setImages_user({ currentUsername, showOptions }) {
  const { userImages } = useUserImages(currentUsername);
  const { setImages } = useImages();

  useEffect(()=> {
    setImages(userImages || []);
  },[currentUsername, userImages])
  
}

function stripImagesForUsers({
  users,
  setImages,
  setUsers,
  model,
  datetime,
  updateNewImages,
  setNewimages
}) {
  if (process.argv.indexOf("--nobrowser") > -1) return;

  const [ran, setRan] = useState([]);
  const [running, setRunning] = useState();

  if (!users) return;

  if (!running) {
    const { currentUserName } = model;
    if (currentUserName)
      var currentuser = users.find(x => x.username == currentUserName);

    var favoriteusers = users.filter(v => v.favorite);
    var otherusers = users.filter(v => !v.favorite);
    // .nimmsort((a,b)=>{
    // 	return (a.lastUpdated||"") <= (b.lastUpdated||"")
    // });

    var userstorun = (currentuser ? [currentuser] : [])
      .concat(favoriteusers)
      .concat(otherusers)
      .nimmunique(ran, "username");

    //.filter(v=>(running||{}).id!==v.id);

    // .filter(v=>!v.ignore)
    // .filter(v=>!v.ice)
    var user = userstorun[0];
    if (!user) {
      console.log("ALL USERS RAN");
      return;
    }
    setRunning(user);
  }

  if (!running) return;

  return component(getImagesRunner, {
    users,
    setRunning,
    setRan,
    setImages,
    setUsers,
    timeIndex: datetime,
    updateNewImages,
    setNewimages,
    ...running
  });
}
var c = 0;
function getImagesRunner({
  users,
  setRunning,
  setRan,
  setImages,
  setUsers,
  timeIndex,
  updateNewImages,
  setNewimages,
  ...user
}) {
  const imageIds = useImageIds(users);
  const sync = useSync();

  if (!sync) return;
  if (!imageIds) return;

  if (!imageIds[user.username]) return;

  var userimages = imageIds[user.username];
  useEffect(() => {
    browser
      .getImages(
        user.url.replace(/\/$/, "") + "/gallery/?catpath=/",
        true,
        userimages,
        imgs => {
          var userimages = imageIds[user.username].map(x => {
            return { id: x };
          });

          var newimages = imgs.nimmunique(userimages, "id");
          newimages.forEach(x => {
            x.username = user.username;
            x.seen = false;
            x.datetime = timeIndex;
          });

          setUsers(users => {
            const u = users.find(v => v.username === user.username);
            sync(u).alter("imgcount", userimages.length + newimages.length);
            return [...users];
          });
          setImages(images => {
            images[user.username] = images[user.username] || [];
            images[user.username].push(...newimages);
            return { ...images };
          });
          setNewimages(imgs => [...imgs, ...newimages]);
        }
      )
      .then(() => {
        setRan(ran => {
          return [...ran, user];
        });
        setRunning(null);
        setUsers(users => {
          const u = users.find(v => v.username === user.username);

          sync(u).alter("reachedBottom", true);
          sync(u).alter("lastUpdated", timeIndex);
          return [...users];
        });
      });
  }, userimages);
}
