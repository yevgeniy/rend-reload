import React from 'react';
import { BrowserRouter, Route } from 'react-router-dom';
import UsersPage from './UsersPage';
import SelectedUserPage from './SelectedUserPage';


const App = ()=> {
    
    return (
        <BrowserRouter>
            <Route path="/" exact={true} component={UsersPage} />
            <Route path="/user/:username" exact={true} component={SelectedUserPage} />
            <Route path="/state/:state" exact={true} component={SelectedUserPage} />
        </BrowserRouter>
    )
}

export default App;