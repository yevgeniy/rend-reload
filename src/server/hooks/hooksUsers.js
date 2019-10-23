const{useState,useEffect}=require('nimm-react');
const {useMongoDb} = require('./hooksDb');

let _users$=null;
let _users=null;
const useUsers=function() {
    const[users,setUsers,rerun]=useState(_users);
    const db=useMongoDb();

    useEffect(()=> {
        if (users)
            return;
        if (!db)
            return;
        
        _users$=_users$ || new Promise(res=> {
            db.collection('users').find({}).toArray((err,users)=> {
                err && console.log(err);
                console.log("LOADED USERS");
                
                res(users);
                
            });
        })
        _users$.then(users=> {
            _users=users;
            setUsers(users);
        })
    })

    return {users}

}

module.exports={
    useUsers
}