const { component, useState, useEffect, useCallback } = require("nimm-react");
const {
  useOpenStream,
  useMessageStream,
  useBrowserSystem
} = require("./hooks");

function stripRegUrl() {
  const { on } = useMessageStream("image");
  const [imgs, setimgs] = useState([]);

  on("get-reg", request => {
    let imgid = request.at;
    setimgs(imgs => {
      return Array.from(new Set([...imgs, imgid]));
    });
  });

  on("update", request => {
    let [updates] = request;
    let imgid = request.at;

    if (updates.marked)
      setimgs(imgs => {
        return Array.from(new Set([...imgs, imgid]));
      });
  });

  const ondone = useCallback(imgid => {
    setimgs(imgs => imgs.filter(v => v !== imgid));
  }, []);

  return imgs.map(imgid => component(findImage, { imgid, key: imgid, ondone }));
}

function findImage({ imgid, ondone }) {
  const [img, { update }] = useOpenStream("image", imgid);

  if (!img) return;

  if (!img.href || img.reg) {
    ondone(imgid);
    return;
  }

  return component(strip, { img, update, ondone });
}

function strip({ img, update, ondone }) {
  const browserSystem = useBrowserSystem();
  useEffect(() => {
    if (!browserSystem) return;

    browserSystem.getRegImageSrc(img.href).then(reg => {
      console.log(reg);
      update({ reg });
      ondone(img.id);
    });
  }, [browserSystem]);
}

module.exports = stripRegUrl;
