const nimmsync = require("nimm-sync").default;
const { createChannel } = require("nimm-sync");
const io = require("socket.io")();
const nimreact = require("nimm-react");

io.listen(3001);

const System = {
  uses: [],
  images: [],
  imageids: [],
  showOptions: null,
  newImages: [],
  states: [],
  currentState: null,
  currentUsername: null
};

const images = createChannel("images", {
  get: () => System.images,
  set: images => (System.images = images)
});
const imageids = createChannel("image-ids", {
  get: () => System.images.map(v => v.id),
  links: {
    [images.set]: (out, { key, at, operation, args }) => out()
  }
});
const currentState = createChannel("currernt-state", {
  get: () => System.currentState,
  set: state => (System.currentState = state)
});
const currentUsername = createChannel("current-username", {
  get: () => System.currentUsername,
  set: name => (System.currentUsername = name)
});
const users = createChannel("users", {
  get: () => System.users,
  set: users => (System.users = users)
});
const states = createChannel("states", {
  get: () => System.states,
  set: states => (System.states = states)
});

const user = createChannel("user", {
  get: username => System.db.users.find(v => v.username === username)
});

const showOptions = createChannel("show-options", {
  get: () => System.showOptions,
  set: v => (System.showOptions = v)
});

const definition = nimmsync.create([
  users,
  showOptions,
  user,
  states,
  currentUsername,
  currentState,
  imageids,
  images
]);
const { useStream } = nimmsync.connect(definition, nimreact);

nimmsync.connectSocketIOServer(definition, io);

module.exports = {
  useStream
};
