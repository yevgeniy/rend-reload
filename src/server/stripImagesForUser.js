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

    workgen(function*() {
      let imgs;

      while ((imgs = yield runner.read())) {
        var newimages = imgs.nimmunique(imageIds, (a, b) => a.id === b);
        newimages.forEach(x => {
          x.username = user.username;
          x.seen = false;
          x.datetime = instanceTime;
        });

        imageIds.push(...newimages.map(v => v.id));

        updateMember_users(user.username, {
          imgcount: imageIds.length,
          isEmpty: false
        });
        addNewImages(...newimages);
      }
    }).then(() => {
      updateMember_users(user.username, {
        lastUpdated: instanceTime
      });
    });
  }, [imageIds, user]);
}

module.exports = stripImagesForUser;
