import React from 'react';
import {useState, useEffect} from 'react';
import clsx from 'clsx';
import {AppBar,Toolbar,Typography,makeStyles} from '@material-ui/core'
import {useCurrentUsername, useCurrentState, useImageIds} from './hooks';
import ImageItem from './ImageItem';


const useStyles=makeStyles(theme=> {
    return {
        root:{},
        marking:{
            cursor:'pointer',
        },
        images:{
            display:'flex',
            flexWrap:'wrap',
        }
    }
})

const SelectedUserPage=(props)=> {
    const classes=useStyles();
    const {currentUsername, user, setCurrentUsername}=useCurrentUsername();
    const {currentState:selectedState, setCurrentState}=useCurrentState();
    
    const {imageids} = useImageIds();
    const {scrollTop, screenHeight} = useScrolling();
    const marking=useM();

    const [selectedImage, setSelectedImage]=useState(null);
    
    useEffect(()=> {
        props.match.params.state
            && setCurrentState(+props.match.params.state)
        return ()=>setCurrentState(null);
    },[])
    useEffect(()=> {
        props.match.params.username
            && setCurrentUsername(props.match.params.username)
        return ()=>setCurrentUsername(null);
    },[]);

    const renderFrame = ()=> {
        return null;
        // const img= window.System.model.images.find(v=>v.id===selectedImage)
        // if (!img)
        //     return null;
        // return <div></div>

        // return (<FramedImage id={img.id} reg={img.reg}
        //     marked={img.marked}
        //     drawn={img.drawn}
        //     drawing={img.drawing}
        //     setSelectedImage={setSelectedImage}
        //     updateImage={updateImage} />)
    }
    const renderUserHeader =() => {
        if (!user)
            return;
        return (
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" >
                        {user.username}
                    </Typography>
                </Toolbar>
            </AppBar>
        );
    }
    const renderStateHeader = ()=> {
        if (!selectedState)
            return;
        return (
            <AppBar>
                <Toolbar>
                    <Typography variant="h6" >
                        {selectedState}
                    </Typography>
                </Toolbar>
            </AppBar>
        )
    }
    return (
        <div className={clsx(classes.root,{
            [classes.marking]: marking
        })}>
            { renderUserHeader() }
            { renderStateHeader() }

            <div className={classes.images}>
                {
                    (imageids||[]).map((v,i)=>{                                                 

                        return <ImageItem key={i} i={i}
                            scrollTop={scrollTop}
                            screenHeight={screenHeight} 
                            setSelectedImage={setSelectedImage}
                            marking={marking}
                            id={v}
                            />        
                    })
                }
            </div>
            
            
            {
                renderFrame()
            }
        </div>
    )
}



function useScrolling() {
    const [scrollTop, setScrollTop]=useState(0);
    const [screenHeight, setScreenHeight]=useState(window.innerHeight);

    useEffect(()=> {
        let t;
        const onscroll=()=>{
            clearTimeout(t);
            t=setTimeout(()=>{                
                setScrollTop(document.scrollingElement.scrollTop);
                setScreenHeight(window.innerHeight);
            },100);
        }
        document.addEventListener('scroll', onscroll);
        onscroll();
        return ()=> {
            document.removeEventListener('scroll', onscroll);
        }
    },[])
    
    return {scrollTop, screenHeight};
}
function useM() {
    const [marking,setMarking]=useState(false);
    useEffect(()=> {
        var onM=e=>{
            if (e.key=='m')
                setMarking(!marking);
        }
        document.addEventListener('keyup', onM);
        return ()=> {
            document.removeEventListener('keyup', onM);
        }
    });
    
    return marking;
}


export default SelectedUserPage;