const{useCallback, useState,useEffect}=require('nimm-react')

const io= require("socket.io")();
io.listen(3001);

const Model={
    globalStatus:'started',
    showOptions:null,
    log:[],
    users:[],
    images:[],
    newImages:[],
    requests:[],
    states:[],
    currentState:null,
    currentUserName:null,
    deleteRequests:[]
}

function useModel() {
    const[val,setVal]=useState();

    const syncModel=useCallback((fn)=> {
        
    },[])

    return [val, syncModel]
}
function useModelUsers() {
    const[users, syncModel]=useModel();

    const syncUsers=useCallback( u=> {
        
    },[]);

    return {users, syncUsers};
}

function useModelImages() {
    const [images, syncModel]=useModel();

    const syncImages=useCallback( ()=> {

    },[]);

    return {images, syncImages};
}
function useModelStates() {
    const [states, syncModel]=useModel()

    const syncStates=useCallback(newstates=> {
        
    },[])

    return {states,syncStates};
}

module.exports = {
    useModel,
    useModelUsers,
    useModelImages,
    useModelStates
}