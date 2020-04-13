const {useOpenStream, useMessageStream} = require("./hooksSystem");

useOpenStream.user=function(username) {
  const [user, opts]=useOpenStream('user', username);
  
  useMessageStream('users')
    .on('updateMember', (message )=>{
      const [username]=message;
console.log('a',message, username)
      username===user.username && opts.get()
    })

  return [user,opts];
}

module.exports = {
  ...require("./hooksDb"),
  ...require("./hooksImages"),
  ...require("./hooksSystem"),
  useOpenStream
};
