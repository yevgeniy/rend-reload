const nimmsync = require("nimm-sync").default;
const { createChannel } = require("nimm-sync");
const io = require("socket.io")();
const nimreact = require("nimm-react");

io.listen(3001);

const System = {
  db: {
    users: [],
    images: {}
  },
  showOptions: null,
  newImages: [],
  states: [],
  currentState: null,
  currentUserName: null
};

const users = createChannel("users", {
  get: () => System.db.users,
  set: users => (System.db.users = users)
});
const states = createChannel("states", {
  get: () => System.states,
  set: times => (System.states = times)
});

const usernames = createChannel("user-names", {
  get: () => System.db.users.map(v => v.username),
  links: {
    [users.set]: (out, { key, at, operation, args }) => out()
  }
});

const user = createChannel("user", {
  get: username => System.db.users.find(v => v.username === username)
});

const showOptions = createChannel("show-options", {
  get: () => System.db.showOptions,
  set: v => (System.db.showOptions = v)
});

const definition = nimmsync.create([
  users,
  showOptions,
  usernames,
  user,
  states
]);
const { useStream } = nimmsync.connect(definition, nimreact);

nimmsync.connectSocketIOServer(definition, io);

module.exports = {
  useStream
};
