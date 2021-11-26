import { Fragment, useContext, useState } from 'react';
import {
  Button,
  LinearProgress,
  Chip,
  InputAdornment,
  Paper,
  Tooltip,
  Alert,
  AlertTitle,
  Snackbar,
} from '@mui/material';
import { Column, Row, RowLabel, LabelWith, StyledTextField, TransactionButton } from '../config/defaults';
import { Link, useParams } from 'react-router-dom';

import { LabelWithText } from '../config/defaults';

import { useMoralisQuery } from 'react-moralis';
import Moralis from 'moralis';

import { Web3Context, TaskContext, WalletContext } from './context/context';
import { isPositiveInt, isValidAddress, shortenAddress, clamp, getTaskState, taskTimeDeltaInfo } from '../config/utils';
import { useMoralisDapp } from '../providers/MoralisDappProvider/MoralisDappProvider';

import { getIcon, getReadableDate } from '../config/utils';
import { Box } from '@mui/system';

import EAService from '../services/ea';
import { render } from '@testing-library/react';

export const DisplayTask = () => {
  const { id } = useParams();
  const { tasks } = useContext(TaskContext);
  if (!tasks.length) return null;
  return <Task detailed task={tasks[id]} taskId={id} />;
};

export const Task = ({ task, taskId, detailed }) => {
  const [userId, setUserId] = useState('');
  const [userIdTouched, setUserIdTouched] = useState(false);
  const [severity, setSeverity] = useState('info');
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState('');
  // const

  const { walletAddress, signContract, handleTx, handleTxError } = useContext(WalletContext);
  const { tokenWhitelistAddressToSymbol } = useContext(Web3Context);
  const { updateTasks } = useContext(TaskContext);

  let description, title, username, message, ethAddress;
  //const { walletAddress } = useMoralisDapp();

  const { data } = useMoralisQuery('Task', (query) =>
    query
      .exists('taskId')
      .equalTo('taskId', taskId.toString())
      .select('description', 'title', 'taskId', 'user', 'message')
  );

  if (data[0]) {
    const parsedData = JSON.parse(JSON.stringify(data[0]));
    description = parsedData.description;
    title = parsedData.title;
    username = parsedData.user.username;
    message = parsedData.message;
    ethAddress = task.sponsor;
    // console.log('user name', parsedData.user?.name);
  }

  description = description || 'No description given';
  title = title || `Task ${taskId}`;
  username = username || shortenAddress(task.sponsor);
  message = message || 'No message given';

  if (!task) return <div>loading ...</div>;

  const isPublic = task.promoter == 0;
  const now = new Date().getTime();

  const error =
    (task.status !== 1 && 'task has been cancelled') ||
    (now < task.startDate && "task hasn't started") ||
    (task.endDate <= now && 'task has ended') ||
    (!isPublic && walletAddress !== task.promoter && 'task is assigned to someone else') ||
    (!isPositiveInt(userId) && 'invalid user id');

  const canFulfillTask = !error;

  const fulfillTask = (id) => {
    if (isPublic) signContract.fulfillPublicTask(id, userId).then(handleTx).then(updateTasks).catch(handleTxError);
    else signContract.fulfillTask(id).then(handleTx).then(updateTasks).catch(handleTxError);
  };
  // console.log(task);

  // console.log(task.startDate < now, now < task.endDate, isPublic || walletAddress === task.promoter, task.status == 1);

  const checkFulfill = async () => {
    let result = await EAService.getResult(task, walletAddress, userId);
    console.log('Result', result);

    const responseStatus = result.responseStatus;
    const score = result.score;

    if (responseStatus === 2) {
      setSeverity('error');
      setMsg('There was a mistake in processing your request. Please try again later.');
      setOpen(true);
    }

    if (responseStatus === 0) {
      setSeverity('warning');
      setMsg('We have not found any post matching the task requirements.');
      setOpen(true);
    }

    if (responseStatus === 1) {
      setSeverity('success');
      setMsg(`We have found a matching post! Your current score is ${score}, depending on the requirements, you might be
      eligible for rewards.`);
      setOpen(true);
    }
  };

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };

  const progress = clamp(((now - task.startDate) / (task.endDate - task.startDate)) * 100, 0, 100);
  const taskState = getTaskState(task);

  return (
    <Column style={{ position: 'relative' }}>
      <Row>
        <Row>
          <LabelWithText
            label={isPublic ? 'Public task' : 'For ' + shortenAddress(task.promoter)}
            tooltip={!isPublic && task.promoter}
          />
          <LabelWithText label="Created by" text={username} tooltip={task.sponsor} tooltipPlacement="component" />
        </Row>
        {getIcon('Twitter')}
      </Row>

      <Row>
        <LabelWith placement="right" label={taskTimeDeltaInfo(task)}>
          <Chip label={taskState} color={taskState === 'Open' ? 'success' : 'error'} />
        </LabelWith>
        <LabelWithText
          label="Reward"
          text={task.depositAmount.toString() + ' ' + tokenWhitelistAddressToSymbol[task.erc20Token].toString()}
        />
      </Row>
      <LinearProgress variant="determinate" value={progress} />
      <Row>
        <Tooltip title={new Date(task.startDate).toString()} placement="top">
          <Box>
            <LabelWithText label="Starts" text={getReadableDate(new Date(task.startDate))} />{' '}
          </Box>
        </Tooltip>
        <Tooltip title={new Date(task.endDate).toString()} placement="top">
          <Box>
            <LabelWithText label="Ends" text={getReadableDate(new Date(task.endDate))} />
          </Box>
        </Tooltip>
      </Row>
      <h3>{title ? title : 'Task ' + taskId}</h3>

      <Paper elevation={4} sx={{ padding: '1em' }}>
        <Row>
          <LabelWithText
            placement="top"
            label="Description"
            text={detailed ? description : description.slice(0, 90) + ' ...'}
          />
        </Row>
        {!detailed && (
          <Button component={Link} to={'/task/' + taskId}>
            view details
          </Button>
        )}
      </Paper>

      {detailed && (
        <Fragment>
          {isPublic && (
            <Row>
              <RowLabel
                variant="standard"
                style={{ justifyContenet: 'left' }}
                label="Enter your Twitter user id"
                tooltip="This is the user id of the Twitter account you made the Tweet with."
                tooltipPlacement="?"
                placement="left"
              >
                <StyledTextField
                  label="Twitter User Id"
                  value={userId}
                  error={userIdTouched && !isPositiveInt(userId)}
                  helperText={userIdTouched && !isPositiveInt(userId) && 'Enter a valid user id'}
                  onChange={({ target }) => {
                    setUserIdTouched(true);
                    setUserId(target.value);
                  }}
                />
              </RowLabel>
            </Row>
          )}
          <TransactionButton
            color="primary"
            tooltip={'Check if you have met the conditions of the promotion'}
            onClick={checkFulfill}
          >
            Check eligibility
          </TransactionButton>
          <TransactionButton tooltip={error} onClick={() => fulfillTask(taskId)} disabled={!canFulfillTask}>
            Fulfill Task
          </TransactionButton>
          <Snackbar open={open} autoHideDuration={5000} onClose={handleClose}>
            <Alert severity={severity} onClose={handleClose}>
              {msg}
            </Alert>
          </Snackbar>
        </Fragment>
      )}
    </Column>
  );
};
