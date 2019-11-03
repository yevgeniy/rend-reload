const {
  useOpenStream,
  useMessageStream,
  image,
  newImages,
  users
} = require("./hooksSystem");

const useUsers = function() {
  const [users, { set, updateMember }] = useOpenStream("users");

  const setUsers = users => {
    set(users);
  };
  const updateUser = (username, u) => {
    updateMember(username, u);
  };

  return { users, setUsers, updateUser };
};
const useStates = function() {
  const [states, { set }] = useOpenStream("states");

  const setStates = states => {
    set(states);
  };

  return { states, setStates };
};
const useShowOptions = function() {
  const [showOptions] = useOpenStream("show-options");
  return { showOptions };
};
const useCurrentUsername = function() {
  const [currentUsername] = useOpenStream("current-username");
  return { currentUsername };
};
const useCurrentState = function() {
  const [currentState] = useOpenStream("current-state");
  return { currentState };
};
const useNewImages = function() {
  const [newImages, { push }] = useOpenStream("new-images");
  const pushNewImages = images => push(...images);
  return { newImages, pushNewImages };
};
const useImages = function() {
  const [images, { set }] = useOpenStream("images");
  const setImages = i => set(i);
  return { images, setImages };
};
const useImage = function(at) {
  const [image, { on }] = useOpenStream("image", at);
  /* const {on}=useMessageStream('image', at) */

  /* const [image, {on,open}]=useStream('image', at);
     open(); */

  return { image, on };
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
