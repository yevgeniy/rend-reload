const{useCallback, useState,useEffect}=require('nimm-react')

var IO=require('socket.io')();
IO.listen(3001);
var {onupdate, io:sync, register} = require('nimm-sync');

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
register(IO, Model);

function useModel(extractor) {
    const[val,setVal]=useState(extractor(Model));

    useEffect(()=>{
        const d= onupdate(changes=> {
            changes=changes || [];
            const newval = extractor(Model);
            if (newval && changes.some(v=>v===newval)) {
                if (newval.constructor===Array)
                    setVal([...newval])
                else if (newval.constructor===Object)
                    setVal({...newval})
            } else
                setVal(newval);
        });
        return ()=>d.destroy();
    });

    const syncModel=useCallback((fn)=> {
        fn(sync);
        const newval = extractor(Model);
        if (newval) {
            if (newval.constructor===Array)
                setVal([...newval])
            else if (newval.constructor===Object)
                setVal({...newval})
            else 
                setVal(newval);
        } else
            setVal(newval);
    },[])

    return [val, syncModel]
}
function useModelUsers() {
    const[users, syncModel]=useModel(model=>model.users);

    const syncUsers=useCallback( u=> {
        var addusers = u.nimmunique(users, 'username');
        var removeusers = users.nimmunique(u,'username');
        syncModel(sync=> {
            sync(Model.users).push(...addusers);
            sync(Model.users).removeAll(...removeusers);
            sync(Model.users).sort((a,b)=>a.username.toLowerCase()<=b.username.toLowerCase());   
        })
    },[]);

    return {users, syncUsers};
}

function useModelImages() {
    const [images, syncModel]=useModel(model=>model.images);

    const syncImages=useCallback( (imgs, dosort=false)=> {

        var newimages=imgs.nimmunique(images, 'id')
        newimages = newimages || [];

        var oldimages=images.nimmunique(imgs, 'id')
        oldimages = oldimages || [];

        if (dosort)
            newimages.nimmsort((a,b)=>a.id >= b.id)

        syncModel(sync=> {
            sync(Model.images).removeAll(...oldimages);
            sync(Model.images).push(...newimages);
        })
    },[]);

    return {images, syncImages};
}
function useModelStates() {
    const [states, syncModel]=useModel(model=>model.states)

    const syncStates=useCallback(newstates=> {
        syncModel(sync=> {
            sync(Model).alter('states', newstates)
        });
    },[])

    return {states,syncStates};
}

module.exports = {
    useModel,
    useModelUsers,
    useModelImages,
    useModelStates
}