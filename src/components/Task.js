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

import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { CopyToClipboard } from 'react-copy-to-clipboard';

import { Link, useParams } from 'react-router-dom';

import { Column, Row, RowLabel, LabelWith, StyledTextField, TransactionButton } from '../config/defaults';

import { LabelWithText } from '../config/defaults';

import { useMoralisQuery } from 'react-moralis';
import Moralis from 'moralis';

import { Web3Context, TaskContext, WalletContext } from './context/context';
import { isPositiveInt, isValidAddress, shortenAddress, clamp, getTaskState, taskTimeDeltaInfo } from '../config/utils';

import { getIcon, getReadableDate } from '../config/utils';
import { Box } from '@mui/system';

import EAService from '../services/ea';

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

  // console.log('task', task);
  const description = task.description || 'No description given';
  const title = task.title || `Task ${taskId}`;
  const message = task.message || 'No message given';
  const sponsorUsername = task.sponsorUsername || shortenAddress(task.sponsor);

  // XXX: insert actual url in production
  const invitationInfo = `Hello 👋\n${sponsorUsername} has invited you to complete ${
    task.title ? `the task "${task.title}"` : 'a task'
  } at TruPr. Come have a look!`;

  const requirementInfo =
    'To be eligible for this task, you must have made a Tweet containing the exact promotion message in the given time frame. A message that is even slightly altered will not pass the check.';

  const rewardInfo = `The total reward is ...`;
  // <Text>
  //   {parseInt(milestone) > 0 && (
  //     <Fragment>
  //       The promoter will be rewarded
  //       {linearRate && (
  //         <Fragment>
  //           {' '}
  //           {metric === 'Time' ? (
  //             <Fragment>over</Fragment>
  //           ) : (
  //             <Fragment>according to their performance measured in</Fragment>
  //           )}
  //           <Emphasis>{METRIC_TO_ID[metric]}</Emphasis>.
  //         </Fragment>
  //       )}{' '}
  //     </Fragment>
  //   )}
  //   The full amount of <Emphasis>{depositAmount}</Emphasis> <Emphasis>{token.symbol}</Emphasis> is paid out{' '}
  //   {!(parseInt(milestone) > 0) ? (
  //     <Fragment>
  //       <Emphasis>immediately</Emphasis>.
  //     </Fragment>
  //   ) : (
  //     <Fragment>
  //       {metric === 'Time' ? (
  //         <Fragment>
  //           after
  //           <Emphasis>{formatDuration(milestone)}</Emphasis>
  //         </Fragment>
  //       ) : (
  //         <Fragment>
  //           upon reaching
  //           <Emphasis>{(milestone || missing) + ' ' + METRIC_TO_ID[metric]}</Emphasis>.
  //         </Fragment>
  //       )}
  //     </Fragment>
  //   )}
  // </Text>
  // {cliffPeriod > 0 && (
  //   <Text>
  //     Any payout will be delayed by <Emphasis>{formatDuration(cliffPeriod)}</Emphasis>.
  //   </Text>
  // )}

  // if (!task) return <div>loading ...</div>;

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
    <Column style={{ position: 'relative', textAlign: 'left' }}>
      <Row>
        <Row>
          <LabelWithText
            label={isPublic ? 'Public task' : 'For ' + shortenAddress(task.promoter)}
            tooltip={!isPublic && task.promoter}
          />
          <LabelWithText
            label="Created by"
            text={sponsorUsername}
            tooltip={task.sponsor}
            tooltipPlacement="component"
          />
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
      <h2 style={{ textAlign: 'center' }}>{title ? title : 'Task ' + taskId}</h2>

      {/* <Row> */}
      {/* </Row> */}
      {!detailed && (
        <Fragment>
          <Paper elevation={2} sx={{ padding: '1em' }}>
            <LabelWithText placement="top" label="Description" text={description.slice(0, 90) + ' ...'} />
            <Button component={Link} to={'/task/' + taskId}>
              view details
            </Button>
          </Paper>
        </Fragment>
      )}

      {detailed && (
        <Fragment>
          {/* <h3>Task Description</h3>
          asldfjsaldfjlskdjf */}
          <Row>
            <LabelWithText placement="top" label="Task description" text={description} />
          </Row>
          {task.description && (
            <CopyToClipboard text={invitationInfo}>
              <Button>
                <ContentCopyIcon /> Copy Task Invitation
              </Button>
            </CopyToClipboard>
          )}
          <Row>
            <LabelWithText placement="top" label="Promotion message" text={message} />
          </Row>
          {task.message && (
            <CopyToClipboard text={task.message}>
              <Button>
                <ContentCopyIcon /> Copy Message
              </Button>
            </CopyToClipboard>
          )}
          <Row>
            <LabelWithText placement="top" label="Requirements" text={requirementInfo} />
          </Row>
          <Row>
            <LabelWithText placement="top" label="Reward" text={rewardInfo} />
          </Row>
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
