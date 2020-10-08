const { component, useState, useEffect, useCallback } = require("nimm-react");
const { useMessageStream, useOpenStream } = require("./hooks");

function getImagesByKeyword({ db }) {
  const { on } = useMessageStream("images");
  const { set: set_keywordimages } = useMessageStream("keyword-images");

  on("get-images-by-keyword", async ([keyword, size]) => {
    console.log("GETTING: ", keyword, size);
    const res = await db
      .collection("images")
      .aggregate([{ $match: { keywords: keyword } }, { $sample: { size } }])
      .toArray();

    set_keywordimages(images => {
      return [[...images, ...(res || [])].nimmdistinct("id")];
    });

    return res;
  });
}

module.exports = getImagesByKeyword;
