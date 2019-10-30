const { useState, useEffect } = require("nimm-react");
const MongoClient = require("mongodb").MongoClient;
var CONFIG = require("config");

let _db$ = null;
function useMongoDb() {
  const [db, setDb] = useState(null);

  useEffect(() => {
    if (db) return;
    _db$ =
      _db$ ||
      new Promise(res => {
        const mongoclient = new MongoClient(CONFIG.mongodb, {
          useNewUrlParser: true,
          useUnifiedTopology: true
        });

        new Promise(res => {
          mongoclient.connect(e => res(e));
        }).then(connecterr => {
          if (connecterr) {
            console.error(connecterr);
            return;
          }
          res(mongoclient.db("rend"));
        });
      });
    _db$.then(setDb);
  }, [db]);

  return db;
}

module.exports = {
  useMongoDb
};
