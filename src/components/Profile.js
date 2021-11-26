import { useMoralisDapp } from '../providers/MoralisDappProvider/MoralisDappProvider';
import { useMoralis } from 'react-moralis';
import { getEllipsisTxt } from '../helpers/formatters';
import Blockie from './Blockie';
import React, { useState, useEffect } from 'react';
import Address from './Address/Address';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Divider, Grid, Paper } from '@mui/material';
import { TextField } from '@mui/material';
import Button from '@mui/material/Button';

const Profile = () => {
  const { refetchUserData, setUserData, userError, isUserUpdating, user, isAuthUndefined, isAuthenticated } =
    useMoralis();
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');

  useEffect(() => {
    if (!isAuthUndefined && isAuthenticated) {
      refetchUserData();
    }

    console.log(user.attributes);
  }, [username, bio]);

  if (isAuthUndefined) {
    return <div>loading</div>;
  }

  const handleClick = () => {
    setUserData({
      username: username,
      bio: bio,
    });
  };

  return (
    <div>
      <Box>
        <Blockie currentWallet scale={20} />
        <Grid>
          <Typography
            style={{ border: '1px', fontFamily: 'Rubic', fontSize: '20px', paddingTop: '10px' }}
            mt={2}
            mb={2}
          >
            {user.attributes.username}
          </Typography>
          <Address size={14} copyable style={{ fontSize: '20px', justifyContent: 'center' }} />
          <Typography mt={2} style={{ border: '1px', fontFamily: 'Rubic', fontSize: '20px' }}>
            {' '}
            {user.attributes.bio ? user.attributes.bio : 'Empty bio'}{' '}
          </Typography>
        </Grid>
        <Box style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
          <TextField
            id="outlined-basic"
            label="Username"
            variant="outlined"
            value={username}
            margin="normal"
            onChange={(event) => {
              console.log(event.target.value);
              setUsername(event.target.value);
            }}
          />
          <Divider variant="middle" />
          <TextField
            id="outlined-basic"
            label="Bio"
            variant="outlined"
            margin="normal"
            value={bio}
            onChange={(event) => {
              console.log(event.target.value);
              setBio(event.target.value);
            }}
          />
          <Button
            style={{ marginBottom: '10px', marginTop: '5px' }}
            variant="contained"
            onClick={handleClick}
            disabled={isUserUpdating}
          >
            Submit changes
          </Button>
        </Box>
      </Box>
    </div>
  );
};

export default Profile;
