import {useState, useEffect} from 'react';
import {useModel, useUsers} from './';

export function useSelectedUser() {
    const[selectedUserName, syncModel]=useModel(model=>model.currentUserName);
    const {users}=useUsers();
    const[user,setUser]=useState(null);

    useEffect(()=> {
        if (!users)
            return;
        switch(selectedUserName) {
            case '__MARKED_IMAGES__':
            case '__NEW_IMAGES__':
                setUser({
                    username:selectedUserName
                })
                break;
            default:
                setUser(users.find(v=>v.username===selectedUserName));
        }
    },[selectedUserName, users]);

    const syncSelectedUserName=name=> {
        syncModel(sync=> {
            sync(window.System.model).alter('currentUserName', name);
        });
    }

    return {selectedUserName, user, syncSelectedUserName}
}
