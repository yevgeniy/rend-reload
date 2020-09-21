const { component, useState, useEffect, useCallback } = require("nimm-react");
const {
  useOpenStream,
  useMessageStream,
  useBrowserSystem
} = require("./hooks");
var browsersystem = require("../browser");

function updateUsers() {
  const [users, { on, add, send }] = useOpenStream("users");

  on("update-users", () => {
    browsersystem.stripUsers().then(res => {
      const newUsers = res.nimmunique(users, "username");
      const oldUsers = users.nimmunique(res, "username");

      console.log("NEW USERS", newUsers.length);
      add(...newUsers);

      console.log("DELETING USERS", oldUsers);
      oldUsers.forEach(v => {
        send("delete", v.username);
      });
    });
  });
}

module.exports = updateUsers;
