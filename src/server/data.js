const {component, useState, useEffect, useResetableState, useRef} = require('nimm-react');
const {useMongoDb, useUpdate} = require('./hooks');

module.exports=function({datetime, images, setImages, users, setUsers, model, newimages, syncStates}) {

    const db=useMongoDb();
    if (!db)
        return;

    //const {currentUserName}=model;

    
        
    return [
        //component(loadUsers, {users,setUsers,db}),
        // component(loadStates, {db, syncStates}),
        // component(loadImagesForUser, {currentUserName,db,setImages}),
        // component(updateImages, {db, images:[...model.images]}),
        // component(updateUsers, {db, users}),
        // component(saveNewImages, {db, newimages})
    ]
}

function loadStates({db, syncStates}) {
    useEffect(()=> {
        new Promise(res=>
            db.collection('images').distinct('datetime'
                ,(err,times)=>res([err,times]) ))
        .then(([err,res])=> {
            if (err) {
                console.log(err);
                return;
            }

            syncStates(res);
        })
    },[])
}

function saveNewImages({db, newimages}) {
    const prev=useRef(newimages);

    useUpdate(()=> {
        const newimgs = newimages.nimmunique(prev.current, 'id');
        prev.current=newimages;
        if (!newimgs.length)
            return;
        console.log(`NEW IMAGES: ${newimgs[0].username}, ${newimgs.length}`)        
        newimgs.forEach(v=> {
            db.collection('images').insertOne(v, err=>err && console.log(err));
        })
    })
}

function updateUsers({db,users}) {

    const[change,setChanged]=useState(1);

    useEffect(()=> {
        const a=NIMM_SYNC.onupdate((changes)=>{
            (changes||[]).nimmjoin(users).length > 0
                && setChanged(c=>c+1);
        });

        return ()=> {
            a.destroy();
        }
    })

    if (!db)
        return;
    if (!users)
        return;

    return users.map(user=>component(updateUser, {db, ...user}))
}
function updateUser({db, ...user}) {
    const [comp]=useResetableState(({username, favorite, ice, imgcount, lastUpdated, reachedBottom})=> {
        
        useUpdate(()=> {
            db.collection('users').updateOne(
                {username}
                , {$set: {
                    favorite,
                    ice,
                    imgcount,
                    lastUpdated,
                    reachedBottom
                }}
                , err=>{
                    if (err) {
                        console.log(err);
                        return;
                    }
                    console.log(`UPDATED USER: ${username}`);
                });
        })

        
    }, [user.username])

    return component(comp, user);
}

function updateImages({db, images}) {

    const[_,setChanges]=useState(0)

    useEffect(()=> {
        const a=NIMM_SYNC.onupdate((changes)=>{
            (changes||[]).nimmjoin(images).length
                && setChanges(c=>c+1);
        });

        return ()=> {
            a.destroy();
        }
    });

    if (!db)
        return;

    return images.map(img=>{
        return component(updateImage, {db, ...img})
    });
}
function updateImage({db, ...img}) {

    const[comp]=useResetableState(({id, marked, drawn, drawing, seen})=> {
        useUpdate(()=> {
            new Promise(res=>
                db.collection('images').updateOne(
                    {id}, {$set: {marked, drawn, drawing, seen}}
                    , e=>res(e)))
            .then(err=> {
                if (err)
                    console.log(err);
                console.log('UPDATED IMAGE: ' + id)
            })
        })
    },[img.id]);

    return component(comp, img);
}

function loadImagesForUser({currentUserName,db,setImages}) {
    const [requested,setRequested]=useState([])
    
    if (!currentUserName)
        return;
    if (requested.indexOf(currentUserName)>-1)
        return;
    
    setRequested([...requested, currentUserName])

    new Promise(res=>
        db.collection('images').find({username:currentUserName})
            .toArray((err,imgs)=>res([err,imgs])))
    .then(([err,res])=> {
        if (err){
            console.log(err);
            return;
        }
        setImages(images=> {
            return {...images, [currentUserName]: res}
        });
    });
}

function loadUsers({users,setUsers,db}) {

    if (users)
        return;
  
    db.collection('users').find({}).toArray((err,users)=> {
        err && console.log(err);
        console.log("LOADED USERS");
        setUsers(users);        
    });
}