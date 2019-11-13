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

const newImages = createChannel("new-images", {
  get: () => System.newImages,
  add: (...imgs) => System.newImages.push(...imgs)
});

const images = createChannel("images", {
  get: () => System.images,
  set: images => (System.images = images),
  getImageIds: () => System.images.map(v => v.id)
});
const image = createChannel("image", {
  get: at => System.images.find(v => v.id === at)
});
const currentState = createChannel("current-state", {
  get: () => System.currentState,
  set: state => (System.currentState = state)
});
const currentUsername = createChannel("current-username", {
  get: () => System.currentUsername,
  set: name => (System.currentUsername = name)
});
const users = createChannel("users", {
  get: () => System.users,
  set: users => (System.users = users),
  updateMember: (username, u) => {
    System.users = System.users.map(v =>
      v.username === username ? { ...v, ...u } : v
    );
  }
});
const states = createChannel("states", {
  get: () => System.states,
  set: states => (System.states = states)
});

const user = createChannel("user", {
  get: username => System.users.find(v => v.username === username)
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
  images,
  image,
  newImages
]);
const { useStream, useMessageStream, useOpenStream } = nimmsync.connect(
  definition,
  nimreact
);

nimmsync.connectSocketIOServer(definition, io);

module.exports = {
  useStream,
  useMessageStream,
  useOpenStream,
  users,
  showOptions,
  user,
  states,
  currentUsername,
  currentState,
  images,
  image,
  newImages
};
