const { component, useState, useEffect, useCallback } = require("nimm-react");
const { useMessageStream, useOpenStream } = require("./hooks");

function deleteImages({ db }) {
  const { on } = useMessageStream("images");
  const [newimages, { set: set_newImages }] = useOpenStream("new-images");
  const { updateMember: updateMember_users } = useMessageStream("users");

  on("delete", async ([username]) => {
    console.log("delete images for ", username);

    await db.collection("images").deleteMany({ username });

    set_newImages(newimages.filter(v => v.username !== username));

    updateMember_users(username, { isEmpty: true, imgcount: null });

    return true;
  });
}

module.exports = deleteImages;
