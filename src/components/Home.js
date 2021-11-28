// import { Link } from '@mui/material';
import { ContractVitals, DashBoard } from './Dashboard';
import { CreateTask } from './CreateTask';
import { OpenTasks } from './OpenTasks';

import Chains from './Chains/Chains';
import Account from './Account';
import Profile from './Profile';

import { useMoralis } from 'react-moralis';

import { ReactComponent as TwitterLogo } from '../images/twitter.svg';
import { ReactComponent as DiscordLogo } from '../images/discord.svg';
import { ReactComponent as GithubLogo } from '../images/github.svg';
import { ReactComponent as MoralisLogo } from '../images/moralis.svg';
import { ReactComponent as ChainlinkLogo } from '../images/chainlink.svg';
import { ReactComponent as AvalancheLogo } from '../images/avalanche.svg';
import { ReactComponent as TruPrLogo } from '../images/trupr.svg';

import { BrowserRouter, Routes, Route, Link, useParams } from 'react-router-dom';

import Button from '@mui/material/Button';

import { useState, Fragment, Component } from 'react';

import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { Grid } from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';

import Box from '@mui/material/Box';

import { DisplayTask } from './Task';

const logoHeight = 20;

const SocialsButton = (props) => (
  <Button variant="text" target="_blank" rel="noreferrer" style={{ minWidth: 20, marginInline: 10 }} {...props} />
);

const Socials = () => (
  <Fragment>
    <Box>
      <SocialsButton href="https://chain.link/">
        <ChainlinkLogo style={{ height: logoHeight, width: 'auto' }} />
      </SocialsButton>
      <SocialsButton href="https://moralis.io/">
        <MoralisLogo style={{ height: logoHeight, width: 'auto' }} />
      </SocialsButton>
      <SocialsButton href="https://www.avax.network/">
        <AvalancheLogo style={{ height: logoHeight, width: 'auto' }} />
      </SocialsButton>
    </Box>
    <Box>
      <SocialsButton href="https://github.com/TruPrLabs/">
        <GithubLogo style={{ height: logoHeight, width: 'auto' }} />
      </SocialsButton>
      <SocialsButton href="https://twitter.com/TruPrLabs">
        <TwitterLogo style={{ height: logoHeight, width: 'auto' }} />
      </SocialsButton>
      <SocialsButton href="https://discord.gg/QeCXAGQJYG">
        <DiscordLogo style={{ height: logoHeight, width: 'auto' }} />
      </SocialsButton>
    </Box>
  </Fragment>
);

const Home = () => {
  const [tab, setTab] = useState(window.location?.pathname || '/');
  const { isAuthenticated } = useMoralis();

  const accountInfoToRight = useMediaQuery('(min-width:657px)');
  // const accountInfoToRight = false;
  const bigTopBar = useMediaQuery('(min-width:843px)');
  const showProfile = useMediaQuery('(min-width:980px)');

  // console.log(accountInfoToRight);

  const handleChange = (event, newTab) => {
    setTab(newTab);
  };

  const accountInfo = (
    <Box style={{ display: 'inline-flex', marginLeft: 'auto' }}>
      <Chains />
      <Account />
    </Box>
  );

  const validRoutes = ['/', '/open-tasks', '/create-task', '/profile'];
  return (
    <div className="app" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <BrowserRouter>
        {/* <Grid container style={{ height: '100vh' }}> */}
        <Grid
          container
          className="header"
          alignItems="center"
          sx={{ borderBottom: 0, borderColor: 'divider', bgcolor: 'paper' }}
        >
          <div style={{ padding: '0 1em', ...(!bigTopBar && accountInfoToRight && { width: '100%' }) }}>
            <TruPrLogo />
          </div>
          {!accountInfoToRight && accountInfo}
          <Grid item sx={{ flexGrow: 1 }}>
            <Tabs
              value={validRoutes.includes(tab) ? tab : '/open-tasks'}
              indicatorColor="primary"
              onChange={handleChange}
            >
              <Tab label="Dashboard" component={Link} value={'/'} to={'/'} />
              <Tab label="Open Tasks" component={Link} value={'/open-tasks'} to={'/open-tasks'} />
              <Tab label="Create Task" component={Link} value={'/create-task'} to={'/create-task'} />
              {isAuthenticated && showProfile && (
                <Tab label="Edit profile" component={Link} value={'/profile'} to={'/profile'} />
              )}
            </Tabs>
          </Grid>
          {accountInfoToRight && accountInfo}
        </Grid>

        <Box component="main" className="background" sx={{ flexGrow: 1, p: 3 }}>
          {/* <div className="solar"></div> */}
          <Routes>
            <Route path="/" element={<DashBoard />} />
            <Route path="/open-tasks" element={<OpenTasks />} />
            <Route path="/create-task" element={<CreateTask />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/task/:id" element={<DisplayTask />} />
            <Route path="/" exactly element={<renderFor404Routes />} />
          </Routes>
        </Box>
        <Grid
          container
          className="footer"
          sx={{
            display: 'inline-flex',
            // flexDirection: 'row-reverse',
            borderTop: 1,
            borderColor: 'divider',
            bgcolor: 'paper',
            justifyContent: 'space-between',
          }}
        >
          <Socials />
        </Grid>
        {/* </Grid> */}
      </BrowserRouter>
    </div>
  );
};

export default Home;
