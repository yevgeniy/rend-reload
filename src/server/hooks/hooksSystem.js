const nimmsync = require("nimm-sync").default;
const io = require("socket.io")();
const nimreact = require("nimm-react");

io.listen(3001);

const System = {
  isClientConnected: false,
  users: [],
  images: [],
  keywordimages: [],
  imageIds: [],
  showOptions: null,
  newImages: [],
  states: [],
  currentState: null,
  currentUsername: null,
  allKeyWords: []
};

const allKeyWords = {
  key: "all-key-words",
  get: () => System.allKeyWords,
  set: v => (System.allKeyWords = v)
};
const isClientConnected = {
  key: "is-client-connected",
  get: () => System.isClientConnected,
  set: v => (System.isClientConnected = v)
};

const newImages = {
  key: "new-images",
  get: () => System.newImages,
  add: (...imgs) => System.newImages.push(...imgs),
  set: v => (System.newImages = v)
};

const images = {
  key: "images",
  get: () => System.images,
  set: images => (System.images = images),
  getImageIds: () => (System.images || []).map(v => v.id)
};
const keywordimages = {
  key: "keyword-images",
  get: () => System.keywordimages,
  set: v => (System.keywordimages = v)
};
const image = {
  key: "image",
  get: at => [...System.images, ...System.keywordimages].find(v => v.id === at)
};
const currentState = {
  key: "current-state",
  get: () => System.currentState,
  set: state => (System.currentState = state)
};
const currentUsername = {
  key: "current-username",
  get: () => System.currentUsername,
  set: name => (System.currentUsername = name)
};
const users = {
  key: "users",
  get: () => {
    return System.users;
  },
  set: users => (System.users = users),
  updateMember: (username, u) => {
    System.users = System.users.map(v =>
      v.username === username ? { ...v, ...u } : v
    );
  }
};
const user = {
  key: "user",
  get: username => System.users.find(v => v.username === username)
};
const states = {
  key: "states",
  get: () => System.states,
  set: states => (System.states = states)
};

const showOptions = {
  key: "show-options",
  get: () => System.showOptions,
  set: v => (System.showOptions = v)
};

const definition = nimmsync.create([
  users,
  showOptions,
  user,
  states,
  currentUsername,
  currentState,
  images,
  image,
  newImages,
  isClientConnected,
  allKeyWords,
  keywordimages
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
