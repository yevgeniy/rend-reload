const { useStream } = require("./hooksSystem");

const useUsers = function() {
  const [users, { set }] = useStream("users");

  const setUsers = users => {
    set(users);
  };

  return { users, setUsers };
};

module.exports = {
  useUsers
};
