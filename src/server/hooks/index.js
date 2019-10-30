const { useStream } = require("./hooksSystem");

const useUsers = function() {
  const [users, { set }] = useStream("users");

  const setUsers = users => {
    set(users);
  };

  return { users, setUsers };
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
  const [newImages] = useStream("new-images");
  return { newImages };
};
const useImages = function() {
  const [images, { set }] = useStream("images");
  const setImages = i => set(i);
  return { images, setImages };
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
  useImages
};
