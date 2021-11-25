import React, { Fragment } from 'react';
import { useMemo, useState, useContext } from 'react';
import { Button, InputAdornment } from '@mui/material';
import { DStackColumn, StyledTextFieldInfo, LabelWithText, LabelWith } from '../config/defaults';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Divider from '@mui/material/Divider';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';

import { ethers } from 'ethers';

import { TaskContext, WalletContext, Web3Context } from './context/context';
import { getReadableDate, getTaskState, taskTimeDeltaInfo } from '../config/utils';
import { Link } from 'react-router-dom';

// ================== Contract Infos ====================

const TaskList = ({ tasks }) => (
  <Box sx={{ width: '100%', bgcolor: 'paper', overflow: 'auto', maxHeight: 300 }}>
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

export const DashBoard = () => {
  const { tasks } = useContext(TaskContext);
  const { walletAddress } = useContext(WalletContext);

  const myTasks = tasks.filter((task) => task.promoter === walletAddress);
  const myOpenTasks = myTasks.filter((task) => getTaskState(task) === 'Open');
  const myClosedTasks = myTasks.filter((task) => getTaskState(task) !== 'Open');

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6} lg={4}>
          <DStackColumn>
            <h2>My Open Tasks</h2>
            {myOpenTasks.length ? (
              <TaskList tasks={myTasks} />
            ) : (
              <Typography>No tasks yet.. Head over to open tasks.</Typography>
            )}
          </DStackColumn>
          <DStackColumn>
            <h2>My Closed Tasks</h2>
            {myClosedTasks.length ? (
              <TaskList tasks={myClosedTasks} />
            ) : (
              <Typography>No tasks yet.. Head over to open tasks.</Typography>
            )}
          </DStackColumn>
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
      <DStackColumn>
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
      </DStackColumn>
    </Grid>
  );
};
