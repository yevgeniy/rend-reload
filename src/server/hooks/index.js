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

module.exports = {
  ...require("./hooksDb"),
  ...require("./hooksImages"),
  ...require("./hooksSystem"),
  useUsers,
  useStates
};
