import React from 'react';
import {useState,useEffect,useRef} from 'react';
import clsx from 'clsx';
import {makeStyles} from '@material-ui/core';
import {useImage} from './hooks';

const useStyles=makeStyles(theme=> {
    return {
        root:{
            transition:'all 500ms ease',
            border:'solid #afafaf 1px',
            background:'#dfdfdf',
            marginBottom:-5,
            transition:'opacity 500ms ease',
        },
        drawing:{
            border:'solid blue 5px'
        },
        marked:{
            border:'solid green 5px',
        }
    }
},{name:'ImgItem'})

const ImageItem = React.memo( ({scrollTop,screenHeight,setSelectedImage,marking
        , id,thumb,drawing,drawn,marked,reg,large}) => {    


    const classes=useStyles();
    const {image,updateImage}=useImage({id,thumb,drawing,drawn,marked,reg,large});
    const nodeRef=useRef();
    
    const {src,width,height} = useLoadImageOnScroll({thumb, nodeRef, screenHeight, scrollTop});
    const {opacity} = useLoadingTransition(src);
    
    useEffect(()=> {
        if (!src)
            return;
        updateImage({seen:true})
    },[src])

    const onSelect=elm=>{
        if (marking)
            updateImage({marked:!marked});
        else
            setSelectedImage(id);
    }

    return (
        <div className={clsx(classes.root,{
            [classes.marked]: marked,
            [classes.drawing]: drawing
        }) }
            data-thumb={thumb}
            ref={nodeRef}
            onClick={onSelect}
            style={{width,height,opacity}}>

            <div style={{opacity:drawn ? .5 : 1}}>
                <img className='tween-all'
                    height='200' 
                    style={{opacity:src ? 1 : 0}}
                    src={src || null}/>
            </div>
            
        </div>
    ) 
});

function useLoadImageOnScroll({thumb, nodeRef, screenHeight, scrollTop}) {
    const[isOnScreen, setIsOnScreen]=useState(false);
    const[src,setSrc]=useState(null);
    const[width,setWidth]=useState('200px');
    const[height, setHeight]=useState('200px');
    const imgRef=useRef();

    useEffect(()=> {
        return ()=> {
            imgRef.current && (imgRef.current.src='');
        }
    },[]);

    useEffect(()=> {
        if (!thumb)
            return;
    
        var dims=nodeRef.current.getBoundingClientRect();

        if (dims.bottom>=0 && dims.top <= screenHeight)
            setIsOnScreen(true)

    }, [screenHeight, scrollTop]);

    useEffect(()=> {
        if (!isOnScreen)
            return;
        if (!thumb)
            return;
      
        
        imgRef.current
            && (imgRef.current.src='');

        imgRef.current = new Image();
        imgRef.current.addEventListener('load',()=>{
            setWidth('auto');
            setHeight('auto');
            setSrc(imgRef.current.src);
        })
        imgRef.current.src=thumb;
    },[isOnScreen, thumb]);

    return {src,width,height};
}
function useLoadingTransition(src) {
    const [opacity,setOpacity]=useState(1);
    const prevSrc=useRef(src);

    useEffect(()=> {
        let t;
        if (!prevSrc.current && !!src) {
            setOpacity(0);
            t=setTimeout(()=>setOpacity(1),600);
        } else
            setOpacity(1);
        prevSrc.current=src;
        return ()=>clearTimeout(t);
    },[src]);

    return {opacity}
}

export default ImageItem;