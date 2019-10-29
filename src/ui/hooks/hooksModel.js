import {useState,useEffect} from 'react';

import nimmsync from 'nimm-sync';

const io = require("socket.io-client");
const client=io.connect('http://localhost:3001');

const {useStream}=nimmsync.connectSocketIOClient(client);


export const useModel=(extractor, _init)=> {
    const [val,setVal]=useState();

    

    const syncModel=(fn)=> {
        
    }

    return [val, syncModel]
}