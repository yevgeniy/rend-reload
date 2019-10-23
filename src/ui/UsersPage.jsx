import React from 'react';
import {useUsers,useStates} from './hooks';
import { Link } from 'react-router-dom';
import {
    makeStyles,
    Chip,Avatar,
    Divider
} from '@material-ui/core';

const useStyles = makeStyles(theme => ({
    root: {
      display: 'flex',
      justifyContent: 'center',
      flexWrap: 'wrap',
    },
    chip: {
      margin: theme.spacing(1),
    },
    divider:{
        flexBasis:'100%',
    }
  }));

const UsersPage = React.memo(()=> {

    const {users}=useUsers();
    const {states=[]}=useStates();
    const classes=useStyles();

    const handleDelete=()=> {

    }

    if (!users)
        return null;
    
    return (
        <div className={classes.root}>
            <Chip
                avatar={<Avatar>{`N`}</Avatar>}
                label="New Images"
                clickable
                className={classes.chip}
                color="secondary"
                component={Link}
                to="/user/__NEW_IMAGES__"
            />
            <Chip
                avatar={<Avatar>{`M`}</Avatar>}
                label="Marked Images"
                clickable
                className={classes.chip}
                component={Link}
                to="/user/__MARKED_IMAGES__"
            />

            {
                users.map(user=> {
                    return <Chip
                        key={user.username}
                        avatar={<Avatar>{`${user.username[0]}${user.username[1]}`.toUpperCase()}</Avatar>}
                        label={user.username + ` (${user.imgcount})`}
                        clickable
                        className={classes.chip}
                        color="primary"
                        component={Link}
                        to={`/user/${user.username}`}
                    />
                })
            }

            <Divider className={classes.divider} />

            {
                states.map((state,i)=> {
                    return <Chip
                        key={state}
                        label={i+1}
                        clickable
                        className={classes.chip}
                        color="default"
                        component={Link}
                        to={`/state/${state}`}
                    />
                })
            }            
            
        </div>

    )
})

export default UsersPage;