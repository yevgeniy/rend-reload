import React from "react";
import ReactDOM from "react-dom";
import App from './ui/App';
import io from 'socket.io-client';

var NIMM_SYNC = require('nimm-sync');
window.client = io.connect('http://localhost:3001');
window.System={
    model:null
}
NIMM_SYNC.register(window.client, window.System, 'model');

NIMM_SYNC.onupdate(changes=> {
    console.log(changes);
})

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
