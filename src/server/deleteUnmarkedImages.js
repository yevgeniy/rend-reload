const { component, useState, useEffect, useCallback } = require("nimm-react");
const { useMessageStream, useOpenStream, useImageIds } = require("./hooks");

function deleteUnmarkedImages({ db }) {
  const [images, { on: on_images, set: set_images }] = useOpenStream("images");
  const [newimages, { set: set_newImages }] = useOpenStream("new-images");
  const { updateMember: updateMember_users } = useMessageStream("users");

  on_images("delete-unmarked", async () => {
    console.log("delete unmarked images");

    const toDelete = images.filter(v => !v.marked);

    const deletingids = (toDelete || []).map(v => v.id);
    const effectedusers = (toDelete || []).map(v => v.username).nimmdistinct();

    await db.collection("images").deleteMany({ id: { $in: deletingids } });

    set_images(images.nimmunique(toDelete, "id"));
    set_newImages(newimages.nimmunique(toDelete, "id"));

    effectedusers.forEach(async username => {
      const [err, res] = await new Promise(res =>
        db
          .collection("images")
          .find({ username })
          .toArray((err, imgs) => res([err, imgs || []]))
      );

      updateMember_users(username, {
        isEmpty: !res.length,
        imgcount: res.length
      });
    });

    return true;
  });
}

module.exports = deleteUnmarkedImages;
