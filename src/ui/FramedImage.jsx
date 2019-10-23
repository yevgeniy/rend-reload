var React=require('react');
const {useState, useEffect, useRef}=require('react');
var style=require('styled-components').default;

const FrameDiv=style.div`
    position:fixed;
    width:100%;
    height:100%;
    top:0;
    left:0
`;
const Background=style.div`
    position:absolute;
    background:black;
    opacity:.3;
    width:100%;
    height:100%;
`;
const ImgSetting=style.div`
    position:relative;
    overflow:auto
`;
const Button=style.div`

`;

function FramedImage({updateImage, setSelectedImage, ...img}) {

    const [imgOpacity, setImgOpacity]=useState(0);
    const settingNodeRef=useRef();
    const imgRef=useRef();

    useEffect(()=> {
        if (imgRef.current.complete)
            setImgOpacity(1);
        else
            imgRef.current.onload=()=>{
                setImgOpacity(1);
            }
    },[]);
    useEffect(()=> {
        

        const repos=()=>{
            settingNodeRef.current.style.width = window.innerWidth+'px';
            settingNodeRef.current.style.height = window.innerHeight+'px';	
        }

        window.addEventListener('resize', repos);
        repos();
        
        document.body.style.overflow='hidden';
        return ()=> {
            document.body.style.overflow='auto';
            window.removeEventListener('resize', repos);
        }
    },[])

    const close=()=>setSelectedImage(null);
    const mark=()=>updateImage(img.id, {marked:!img.marked})
    const drawn=()=>updateImage(img.id, {drawn:!img.drawn})
    const drawing=()=>updateImage(img.id,{drawing:!img.drawing})
    
    return (
        <div className="full-frame outer" >
            <FrameDiv >
                <Background/>
                
                
                <ImgSetting ref={settingNodeRef}>
                    <img className='tween-all' src={img.reg}
                        style={{opacity:imgOpacity}}
                        ref={imgRef} />
                </ImgSetting>
                
                <div className="Close close next" onClick={close} style={{top:0, right:0, transform:'none'}}>CLOSE</div>
                <div className="Mark close next" onClick={mark} style={{top:0, right:'150px', transform:'none',
                        background:img.marked ? 'green' : ''
                    }}>MARK</div>
                <div className="Drawn close next" onClick={drawn} style={{top:0, right:'300px', transform:'none',
                        background:img.drawn ? 'green' : ''
                    }}>DRAWN</div>
                <div className="Drawn close next" onClick={drawing} style={{top:'100px', right:'0', transform:'none',
                        background:img.drawing ? 'green' : ''
                    }}>DRAWNING</div>
                
            </FrameDiv>
        </div>
    )
}

module.exports={
    FramedImage
}