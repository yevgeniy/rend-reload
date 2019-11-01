const {
  useStream,
  useMessageStream,
  image,
  newImages,
  users
} = require("./hooksSystem");

const useUsers = function() {
  const [users, { set, updateMember }] = useStream("users");

  const setUsers = users => {
    set(users);
  };
  const updateUser = (username, u) => {
    updateMember(username, u);
  };

  return { users, setUsers, updateUser };
};
const useStates = function() {
  const [states, { set }] = useStream("states");

  const setStates = states => {
    set(states);
  };

  return { states, setStates };
};
const useShowOptions = function() {
  const [showOptions] = useStream("show-options");
  return { showOptions };
};
const useCurrentUsername = function() {
  const [currentUsername] = useStream("current-username");
  return { currentUsername };
};
const useCurrentState = function() {
  const [currentState] = useStream("current-state");
  return { currentState };
};
const useNewImages = function() {
  const [newImages, { push }] = useStream("new-images");
  const pushNewImages = images => push(...images);
  return { newImages, pushNewImages };
};
const useImages = function() {
  const [images, { set }] = useStream("images");
  const setImages = i => set(i);
  return { images, setImages };
};
const useImageUpdates = function(fn) {
  const ondata = useMessageStream(image.update);
  ondata(message => fn(message.at, message.args[0]));
};

module.exports = {
  ...require("./hooksDb"),
  ...require("./hooksImages"),
  ...require("./hooksSystem"),
  useUsers,
  useStates,
  useShowOptions,
  useCurrentUsername,
  useCurrentState,
  useNewImages,
  useImages,
  useImageUpdates,
  userNewImageUpdates,
  useUserUpdates
};
