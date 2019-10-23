import {useEffect} from 'react';
import {useModel} from './hooksModel'

export function useSelectedState(props) {

    const [selectedState, syncModel]=useModel(model=>model.currentState);

    const syncSelectedState=state=> {
        syncModel(sync=> {
            sync(window.System.model).alter('currentState', state);     
        })
    }

    return {selectedState,syncSelectedState};
}