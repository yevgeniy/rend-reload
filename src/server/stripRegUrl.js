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

  on("get-reg", request => {
    let imgid = request.at;
    const b = root(component(findImage, { imgid, ondone: () => b.shutdown() }));
  });

  on("update", request => {
    let [updates] = request;
    let imgid = request.at;

    let b;
    if (updates.marked)
      b = root(component(findImage, { imgid, ondone: () => b.shutdown() }));
  });
}

function findImage({ imgid, ondone }) {
  const [img, { update }] = useOpenStream("image", imgid);

  if (!img) return;

  if (!img.href || img.reg) {
    ondone();
    return;
  }

  return component(strip, { img, update, ondone });
}

function strip({ img, update, ondone }) {
  browsersystem.getRegImageSrc(img.href).then(reg => {
    console.log(reg);
    update({ reg });
    ondone();
  });
}

module.exports = stripRegUrl;
