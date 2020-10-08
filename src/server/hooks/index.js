const { useState } = require("nimm-react");
const { useOpenStream, useMessageStream } = require("./hooksSystem");

useOpenStream.user = function(username) {
  const [user, opts] = useOpenStream("user", username);

  useMessageStream("users").on("updateMember", message => {
    const [username] = message;
    username === user.username && opts.get();
  });

  return [user, opts];
};

function useReload() {
  const [t, sett] = useState(+new Date());
  const { on } = useMessageStream("images");
  on("reload", () => sett(+new Date()));

  return t;
}

module.exports = {
  ...require("./hooksDb"),
  ...require("./hooksImages"),
  ...require("./hooksSystem"),
  ...require("./hookBrowserSystem"),
  useOpenStream,
  useReload
};
