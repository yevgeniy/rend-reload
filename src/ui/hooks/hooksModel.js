import {useState,useEffect} from 'react';
import {onupdate, io as sync} from 'nimm-sync';

const sid=Symbol.for('__sid__');
export const useModel=(extractor, _init)=> {
    const [val,setVal]=useState(_init!==undefined ? _init : extractor(window.System.model||{}));

    useEffect(()=> {
        const d=onupdate(changes=> {
            const s=extractor(window.System.model);
            if (s && typeof s ==='object' && changes.some(v=>v===s)) {
                let ns;
                if (s.constructor===Array) 
                    ns=[...s]; 
                else
                    ns={...s}
                ns[sid] = s[sid];
                setVal(ns)
            } else
                setVal(s);
        });
        return ()=>d.destroy();
    });

    const syncModel=(fn)=> {
        fn(sync);
        const s=extractor(window.System.model);
        if (s && typeof s ==='object') {
            let ns;
            if (s.constructor===Array)
                ns=[...s];
            else
                ns={...s}
            ns[sid] = s[sid];
            setVal(ns);
        } else
            setVal(s);
    }

    return [val, syncModel]
}