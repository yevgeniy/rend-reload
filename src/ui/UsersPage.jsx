import React, { useEffect } from "react";
import { useOpenStream, useMessageStream, useUsers } from "./hooks";
import { Link } from "react-router-dom";
import { makeStyles, Chip, Avatar, Divider, Button } from "@material-ui/core";

const useStyles = makeStyles(theme => ({
  root: {},
  usersList: {
    display: "flex",
    justifyContent: "center",
    flexWrap: "wrap"
  },
  chip: {
    margin: theme.spacing(1)
  },
  divider: {
    flexBasis: "100%"
  },
  controlls: {
    margin: theme.spacing(2)
  }
}));

const UsersPage = React.memo(() => {
  const [users, { request: users_request }] = useUsers();
  let [states] = useOpenStream("states");
  const { set: setIsClientConnected } = useMessageStream("is-client-connected");
  useEffect(() => {
    setIsClientConnected(true);
  }, []);
  states = states || [];

  const classes = useStyles();

  const handleDelete = () => {};
  const updateUsers = () => {
    users_request("update-users");
  };

  if (!users) return null;

  return (
    <div>
      <div className={classes.controlls}>
        <Button color="primary" variant="outlined" onClick={updateUsers}>
          update users
        </Button>
      </div>
      <div className={classes.usersList}>
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

        {users.map(user => {
          return (
            !user.dead && (
              <Chip
                key={user.username}
                avatar={
                  <Avatar>
                    {`${user.username[0]}${user.username[1]}`.toUpperCase()}
                  </Avatar>
                }
                label={user.username + ` (${user.imgcount})`}
                clickable
                className={classes.chip}
                color="primary"
                component={Link}
                to={`/user/${user.username}`}
              />
            )
          );
        })}

        <Divider className={classes.divider} />

        {states.map((state, i) => {
          return (
            <Chip
              key={state}
              label={i + 1}
              clickable
              className={classes.chip}
              color="default"
              component={Link}
              to={`/state/${state}`}
            />
          );
        })}
      </div>
    </div>
  );
});

export default UsersPage;
