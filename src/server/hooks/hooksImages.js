const{useState, useEffect}=require('nimm-react');
const {useMongoDb} = require('./hooksDb')

function useStates() {
    const[states,setStates]=useState(null);
    const db=useMongoDb();

    useEffect(()=> {
        if (!db)
            return;
        new Promise(res=>
            db.collection('images').distinct('datetime'
                ,(err,times)=>res([err,times]) ))
        .then(([err,res])=> {
            if (err) {
                console.log(err);
                return;
            }

            setStates(res);
        })
    },[db])

    return {states};
}
function useMarkedImages() {
    const db=useMongoDb();
    const [markedImages, setMarkedImages]=useState(null)

    useEffect(()=> {
        if (!db)
            return;

        new Promise(res=>
            db.collection('images').find({marked: true})
                .toArray((err,imgs)=>res([err,imgs])))
        .then(([err,imgs])=> {
            if (err) {
                console.log(err);
                return;
            }
            setMarkedImages(imgs);
        })

    },[db])

    return {markedImages};
}
function useStateImages(currentState) {
    const db=useMongoDb();
    const[stateImages,setStateImages]=useState(null);
    
    useEffect(()=> {
        if (!db)
            return;
        if (!currentState) {
            setStateImages(null)
            return;
        }

        new Promise(res=>
            db.collection('images').find({datetime: +currentState})
                .toArray((err,imgs)=>res([err,imgs])))
        .then(([err, imgs])=> {
            if (err) {
                console.log(err);
                return;
            }  
            setStateImages(imgs);
        });
    },[db,currentState])

    return {stateImages};
}
function useUserImages(currentUserName) {
    const db=useMongoDb();
    const[userImages,setUserImages]=useState(null);
    
    useEffect(()=> {
        if (!db)
            return;
        if (!currentUserName) {
            setUserImages(null)
            return;
        }

        new Promise(res=>
            db.collection('images').find({username:currentUserName})
                .toArray((err,imgs)=>res([err,imgs])))
        .then(([err,res])=> {
            if (err){
                console.log(err);
                return;
            }
            setUserImages(res);
        });
    },[db,currentUserName])

    return {userImages};
}

module.exports={
    useMarkedImages,
    useStates,
    useStateImages,
    useUserImages,
}