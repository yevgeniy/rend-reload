const {
  component,
  useState,
  useEffect,
  useCallback,
  useRef
} = require("nimm-react");
const { useOpenStream, useMessageStream, useImageIds } = require("./hooks");
var browsersystem = require("../browser");
const { workgen } = require("../helpers");

function stripImagesForAllUsers({ instanceTime }) {
  if (process.argv.indexOf("--nobrowser") > -1) return;

  let [images, setImages] = useState([]);
  const [states] = useOpenStream("states");
  const [users] = useOpenStream("users");

  useEffect(() => {
    if (!states) return;
    if (!users) return;
    const stream = browsersystem.getWatchStream();

    const breachDate = +(states.slice(-2)[0] || new Date("Apr 28, 2020"));

    workgen(function*() {
      while (true) {
        const [imgs, date] = yield stream.read();

        const lastSeenDate = +new Date(date);

        if (!isNaN(lastSeenDate)) {
          if (lastSeenDate < breachDate) {
            stream.kill();
            setImages([]);
            return;
          }
        }

        if (!imgs.length) continue;

        imgs.forEach(v => {
          v.seen = false;
          v.datetime = instanceTime;
        });

        setImages(i => [...i, ...imgs]);
      }
    });
  }, [states, users]);

  const dict = images.nimmdictionary("username");

  return Object.entries(dict)
    .filter(
      ([username]) => !(users.find(v => v.username === username) || {}).dead
    )
    .map(([key, imgs]) => {
      return component(addUserImages, { key, username: key, imgs });
    });
}

function addUserImages({ username, imgs }) {
  const { add: addNewImages } = useMessageStream("new-images");
  const existingImageIds = useImageIds(username);
  const seenids = useRef([]);

  useEffect(() => {
    if (!existingImageIds) return;
    if (!imgs) return;

    const newimages = imgs.nimmunique(
      [...seenids.current, ...existingImageIds],
      (a, b) => a.id === b
    );
    seenids.current.push(...newimages.map(v => v.id));

    addNewImages(...newimages);

    console.log("add", username, newimages.length);
  }, [username, imgs, existingImageIds]);
}

module.exports = stripImagesForAllUsers;
