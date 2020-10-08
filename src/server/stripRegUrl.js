const {
  component,
  useState,
  useEffect,
  useCallback,
  root
} = require("nimm-react");
const { useOpenStream, useMessageStream } = require("./hooks");
var browsersystem = require("../browser");

function stripRegUrl() {
  const { on } = useMessageStream("image");
  const [ids, setids] = useState([]);

  on("get-reg", request => {
    let imgid = request.at;
    console.log("GET REG", imgid);
    setids(ids => Array.from(new Set([...ids, imgid])));
  });

  on("update", request => {
    let [imgUpdate] = request;
    let imgid = request.at;

    if (imgUpdate.marked) {
      console.log("IS MARKED: ", imgid);
      setids(ids => Array.from(new Set([...ids, imgid])));
    }
  });

  const ondone = useCallback(id => {
    console.log("CLEARING: ", id);
    setids(ids => ids.nimmunique([id]));
  }, []);

  return ids.map(imgid => component(findImage, { key: imgid, imgid, ondone }));
}

function findImage({ imgid, ondone }) {
  console.log("ID: ", imgid);
  const [img, { update }] = useOpenStream("image", imgid);

  useEffect(() => {
    if (!img) return;

    if (!img.href || img.reg) {
      ondone(imgid);
      return;
    }

    browsersystem.getRegImageSrc(img.href).then(reg => {
      console.log(reg);
      update({ reg });
      ondone(imgid);
    });
  }, [img && img.id]);
}

module.exports = stripRegUrl;
