import {useModel} from './hooksModel';

export const useUsers=()=> {
    const [users, syncModel]=useModel(model=>model.users);

    return {users};
}
