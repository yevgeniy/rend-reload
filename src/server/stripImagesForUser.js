const { component, useState, useEffect, useCallback } = require("nimm-react");
const {
  useOpenStream,
  useMessageStream,

  useImageIds
} = require("./hooks");
var browsersystem = require("../browser");
const { workgen } = require("../helpers");

function stripImagesForUser({ instanceTime }) {
  const { on: users_on } = useMessageStream("users");
  const [username, setusername] = useState(null);

  users_on("strip-images", ([r]) => {
    console.log(r);
    setusername(r);
  });

  if (!username) return;

  return component(stripImages, { username, instanceTime });
}
function stripImages({ username, instanceTime }) {
  const [user] = useOpenStream("user", username);
  const { updateMember: updateMember_users } = useMessageStream("users");
  const imageIds = useImageIds(username);
  const { add: addNewImages } = useMessageStream("new-images");

  console.log(user, imageIds);

  useEffect(() => {
    if (!imageIds) return;
    if (!user) return;

    console.log(imageIds, user);
    const runner = browsersystem.getImagesStream(
      user.url.replace(/\/$/, "") + "/gallery/?catpath=/",
      []
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

        updateMember_users(user.username, {
          imgcount: imageIds.length,
          isEmpty: false
        });
        addNewImages(...newimages);
      }
    }).then(() => {
      console.log("done", user.username);
      updateMember_users(user.username, {
        reachedBottom: true,
        lastUpdated: instanceTime
      });
    });
  }, [imageIds, user]);
}

module.exports = stripImagesForUser;
