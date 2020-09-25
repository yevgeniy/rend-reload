const { component, useState, useEffect, useCallback } = require("nimm-react");
const { useMessageStream, useOpenStream, useImageIds } = require("./hooks");

function deleteUnmarkedImages({ db }) {
  const { on } = useMessageStream("images");
  const [newimages, { set: set_newImages }] = useOpenStream("new-images");

  on("delete-unmarked", async ([username]) => {
    console.log("delete unmarked images for ", username);

    await db
      .collection("images")
      .deleteMany({ username, marked: { $ne: true } });

    if (!newimages) return;

    db.collection("images").distinct("id", { username }, (err, ids) =>
      set_newImages(imgs =>
        imgs.nimmjoin(ids || [], (a, b) => {
          if (a.username === username) {
            return a.id === b;
          }

          return true;
        })
      )
    );

    return true;
  });
}

module.exports = deleteUnmarkedImages;
