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
import { BrowserRouter, Routes, Route, Link, useParams } from 'react-router-dom';

import Button from '@mui/material/Button';

import { useState, Fragment, Component } from 'react';

import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { Grid } from '@mui/material';

import Box from '@mui/material/Box';

import { ReactComponent as TruPrLogo } from '../images/trupr.svg';
import { DisplayTask } from './Task';

const logoHeight = 20;
const logoSpacing = 0;

const Socials = () => (
  <div className="socials">
    <Button
      variant="text"
      href="https://github.com/TruPrLabs/"
      target="_blank"
      rel="noreferrer"
      style={{ minWidth: 20, marginInline: logoSpacing }}
    >
      <GithubLogo style={{ height: logoHeight, width: 'auto' }} />
    </Button>
    <Button
      variant="text"
      href="https://twitter.com/TruPrLabs"
      target="_blank"
      rel="noreferrer"
      style={{ minWidth: 20, marginInline: logoSpacing }}
    >
      <TwitterLogo style={{ height: logoHeight, width: 'auto' }} />
    </Button>
    <Button
      variant="text"
      href="https://discord.gg/QeCXAGQJYG"
      target="_blank"
      rel="noreferrer"
      style={{ minWidth: 20, marginInline: logoSpacing }}
    >
      <DiscordLogo style={{ height: logoHeight, width: 'auto' }} />
    </Button>
  </div>
);

const Home = () => {
  const [tab, setTab] = useState(window.location?.pathname || '/');
  const { isAuthenticated } = useMoralis();

  const handleChange = (event, newTab) => {
    setTab(newTab);
  };

  const validRoutes = ['/', '/open-tasks', '/create-task', '/profile'];
  return (
    <div className="app">
      <BrowserRouter>
        <Fragment>
          <Grid
            container
            className="header"
            alignItems="center"
            sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'paper' }}
          >
            <div style={{ padding: '0 1em' }}>
              <TruPrLogo />
            </div>
            <Grid item sx={{ flexGrow: 1 }}>
              <Tabs value={validRoutes.includes(tab) ? tab : '/open-tasks'} onChange={handleChange}>
                <Tab label="Dashboard" component={Link} value={'/'} to={'/'} />
                <Tab label="Open Tasks" component={Link} value={'/open-tasks'} to={'/open-tasks'} />
                <Tab label="Create Task" component={Link} value={'/create-task'} to={'/create-task'} />
                {isAuthenticated && <Tab label="Edit profile" component={Link} value={'/profile'} to={'/profile'} />}
              </Tabs>
            </Grid>
            <Chains />
            <Account />
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
            sx={{ display: 'inline-block', borderTop: 1, borderColor: 'divider', bgcolor: 'paper' }}
          >
            <Socials />
          </Grid>
        </Fragment>
      </BrowserRouter>
    </div>
  );
};

export default Home;
