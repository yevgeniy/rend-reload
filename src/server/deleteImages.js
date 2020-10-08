const { component, useState, useEffect, useCallback } = require("nimm-react");
const { useMessageStream, useOpenStream } = require("./hooks");

function deleteImages({ db }) {
  const [images, { on: on_images }] = useOpenStream("images");
  const [newimages, { set: set_newImages }] = useOpenStream("new-images");
  const { updateMember: updateMember_users } = useMessageStream("users");

  on_images("delete", async ([deletingids]) => {
    console.log("delete images", deletingids);

    deletingids = deletingids || (images || []).map(v => v.id);
    let effectedusers = await db
      .collection("images")
      .distinct("username", { id: { $in: deletingids } });

    await db.collection("images").deleteMany({ id: { $in: deletingids } });

    set_newImages(newimages.nimmunique(deletingids, (a, b) => a.id === b));

    effectedusers.forEach(async username => {
      const res = await db
        .collection("images")
        .find({ username })
        .toArray();

      updateMember_users(username, {
        isEmpty: !res.length,
        imgcount: res.length
      });
    });

    return true;
  });
}

module.exports = deleteImages;
