import React, { Fragment } from 'react';
import { useMemo, useState, useContext } from 'react';
import { Button, Divider, InputAdornment } from '@mui/material';
import { Column, StyledTextFieldInfo, LabelWithText, LabelWith, Row } from '../config/defaults';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

import { ethers } from 'ethers';

import { TaskContext, WalletContext, Web3Context } from './context/context';
import { getReadableDate, getTaskState, taskTimeDeltaInfo } from '../config/utils';
import { Link } from 'react-router-dom';

// ================== Contract Infos ====================

const TaskList = ({ tasks }) => (
  <Box
    sx={{ width: '100%', bgcolor: 'paper', overflow: 'auto', maxHeight: 300 }}
    style={{ display: 'flex', flexDirection: 'column' }}
  >
    {/* <Divider variant="inset" /> */}
    {tasks.map((task) => (
      <LabelWith key={task.id} label={taskTimeDeltaInfo(task)} placement="right">
        <Button variant="text" component={Link} to={'/task/' + task.id} style={{ minWidth: 60 }}>
          {'Task ' + task.id}
        </Button>
      </LabelWith>
    ))}
  </Box>
);

const MyTasks = ({ tasks, headTo = 'Open Tasks', toLink = '/open-tasks' }) => {
  if (tasks.length === 0)
    return (
      <div>
        <Typography>No tasks yet.. Head over to </Typography>
        <Button variant="text" component={Link} to={toLink} style={{ minWidth: 60 }}>
          {headTo}
        </Button>
      </div>
    );

  const myTasksOpen = tasks.filter((task) => getTaskState(task) === 'Open');
  const myTasksClosed = tasks.filter((task) => getTaskState(task) !== 'Open');
  return (
    <Box style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-around' }}>
      <Box style={{ display: 'flex', flexDirection: 'column', flex: '1', alignItems: 'center' }}>
        <h4>Open</h4>
        {myTasksOpen.length && (
          <LabelWith placement="top" variant="standard">
            <TaskList tasks={myTasksOpen} />
          </LabelWith>
        )}
      </Box>
      <Divider style={{ width: '1px', height: 'auto', background: '#747474' }} orientation="vertical" />
      <Box style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: '1' }}>
        <h4>Closed</h4>
        {myTasksClosed.length > 0 && (
          <LabelWith placement="top" variant="standard">
            <TaskList tasks={myTasksClosed} />
          </LabelWith>
        )}
      </Box>
    </Box>
  );
};

export const DashBoard = () => {
  const { tasks } = useContext(TaskContext);
  const { walletAddress } = useContext(WalletContext);

  const myTasks = tasks.filter((task) => task.promoter === walletAddress);
  const createdTasks = tasks.filter((task) => task.sponsor === walletAddress);

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={12} md={6} lg={6}>
          <Column>
            <h2>My Assigned Tasks</h2>
            <MyTasks tasks={myTasks} />
          </Column>
        </Grid>
        <Grid item xs={12} sm={12} md={6} lg={6}>
          <Column>
            <h2>My Created Tasks</h2>
            <MyTasks tasks={createdTasks} headTo="Create Task" toLink="/create-task" />
          </Column>
        </Grid>
      </Grid>
    </Box>
  );
};

export const ContractVitals = () => {
  // console.log('rendering', 'vitals');

  const [contractOwner, setContractOwner] = useState('');
  const [contractBalance, setContractBalance] = useState(0);
  const [taskCount, setTaskCount] = useState(0);

  const { web3Provider, contract } = useContext(Web3Context);

  const handleTxError = (e) => {
    console.error(e);
  };

  useMemo(() => {
    // if (!isConnected) return;
    contract.owner().then(setContractOwner).catch(handleTxError);
    contract.taskCount().then(setTaskCount).catch(handleTxError);
    web3Provider.getBalance(contract.address).then(setContractBalance).catch(handleTxError);
  }, [contract, web3Provider]);

  return (
    <Grid item xs={12} md={6} lg={4}>
      <Column>
        <h2>Contract Infos</h2>
        <StyledTextFieldInfo label="Address" value={contract?.address} />
        <StyledTextFieldInfo label="Owner" value={contractOwner} />
        <StyledTextFieldInfo
          label="Balance"
          value={parseFloat(ethers.utils.formatEther(contractBalance)).toFixed(4)}
          InputProps={{
            startAdornment: <InputAdornment position="start">Ξ</InputAdornment>,
          }}
        />
        <StyledTextFieldInfo label="Task Count" value={taskCount} />
      </Column>
    </Grid>
  );
};
