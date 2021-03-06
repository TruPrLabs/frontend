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
  Typography,
} from '@mui/material';

import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import ReactMarkdown from 'markdown-to-jsx';

import { Link, useParams } from 'react-router-dom';

import { Column, Row, RowLabel, LabelWith, StyledTextField, TransactionButton } from '../config/defaults';

import { LabelWithText } from '../config/defaults';

import { useMoralisQuery } from 'react-moralis';
import Moralis from 'moralis';
import { ethers } from 'ethers';

import { Web3Context, TaskContext, WalletContext } from './context/context';
import { isPositiveInt, isValidAddress, shortenAddress, clamp, getTaskState, taskTimeDeltaInfo } from '../config/utils';

import { formatDuration, getIcon, getReadableDate } from '../config/utils';
import { Box } from '@mui/system';

import EAService from '../services/ea';
import { METRIC_TO_ID } from '../config/config';

export const DisplayTask = () => {
  const { id } = useParams();
  const { tasks } = useContext(TaskContext);
  if (!tasks.length) return null;
  return <Task detailed task={tasks[id]} taskId={id} />;
};

export const getReadableTaskSummary = (
  startDate,
  endDate,
  platform,
  isPublic,
  promoterUserId,
  depositAmount,
  tokenSymbol,
  metric,
  milestone,
  linearRate,
  cliffPeriod,
  missing = '[invalid]'
) => {
  const dateDisplayOptions = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: 'numeric' };
  return (
    <Fragment>
      <Typography>
        <ReactMarkdown>
          {`The task can ${
            isPublic
              ? 'be completed by **anyone**. '
              : `only be completed by **${platform}** user with id **${promoterUserId || missing}**. `
          }` +
            `The task is only counted as valid if completed in the given time frame, starting ` +
            `from **${new Date(startDate).toLocaleDateString('en-US', dateDisplayOptions)}** ` +
            `to **${new Date(endDate).toLocaleDateString('en-US', dateDisplayOptions)}**.`}
        </ReactMarkdown>
      </Typography>

      <Typography>
        <ReactMarkdown>
          {((linearRate &&
            `The promoter will be rewarded ${
              (metric === 'Time' ? 'over ' : `according to their performance measured in `) +
              `**${METRIC_TO_ID[metric]}**. `
            }`) ||
            '') +
            `The full amount of **${
              (isPositiveInt(depositAmount) && ethers.utils.formatEther(depositAmount)) || missing
            }** **${tokenSymbol}** is paid out to the promoter ` +
            (!(parseInt(milestone) > 0)
              ? '**immediately** upon completion of the task.'
              : metric === 'Time'
              ? `after **${formatDuration(milestone)}**.`
              : `upon reaching **${(milestone || missing) + ' ' + METRIC_TO_ID[metric]}**.`) +
            ((cliffPeriod > 0 && ` Any payout will be delayed by **${formatDuration(cliffPeriod)}**.`) || '')}
        </ReactMarkdown>
      </Typography>

      {/* {cliffPeriod > 0 && (
        <Typography>
          <ReactMarkdown></ReactMarkdown>
        </Typography>
      )} */}
    </Fragment>
  );
};

const truprUrl = 'https://www.trupr.xyz/';

export const Task = ({ task, taskId, detailed }) => {
  const [userId, setUserId] = useState('');
  const [userIdTouched, setUserIdTouched] = useState(false);

  const [alertState, setAlertState] = useState({
    open: false,
    message: '',
    severity: undefined,
  });

  const { walletAddress, signContract, handleTx, handleTxError } = useContext(WalletContext);
  const { tokenWhitelist, tokenWhitelistAddressToSymbol } = useContext(Web3Context);
  const { updateTasks } = useContext(TaskContext);

  // console.log('task', task);
  const description = task.description || 'No description given';
  const title = task.title || `Task ${taskId}`;
  const message = task.message || 'No message given';
  const sponsorUsername = task.sponsorUsername || shortenAddress(task.sponsor);

  const promoterUsername = task.promoter || shortenAddress(task.promoter);

  // XXX: insert actual url in production

  const handleAlertClose = (event, reason) => {
    if (reason !== 'clickaway') setAlertState({ ...alertState, open: false });
  };

  const alert = (msg, severity) => {
    setAlertState({
      open: true,
      message: msg,
      severity: severity || 'error',
    });
  };

  const invitationInfo =
    `${sponsorUsername} has invited you to complete ` +
    `${task.title ? `the task "${task.title}"` : 'a task'} ` +
    `at TruPr.\nCome have a look!\n${truprUrl}task/${task.id}`;

  const requirementInfo =
    'To be eligible for this task, you must have made a Tweet containing the exact promotion message in the given time frame. A message that is even slightly altered will not pass the check.';

  const isPublic = task.promoter == 0;
  const now = new Date().getTime();

  const tokenSymbol = tokenWhitelistAddressToSymbol[task.erc20Token].toString();
  // const token = tokenWhitelist[tokenSymbol];

  const taskSummary = getReadableTaskSummary(
    task.startDate,
    task.endDate,
    task.platform,
    task.isPublic,
    task.userId,
    task.depositAmount,
    tokenSymbol,
    task.metric,
    task.milestone,
    task.linearRate,
    task.cliffPeriod,
    '[invalid]'
  );

  // if (!task) return <div>loading ...</div>;

  const error =
    (task.status !== 1 && 'task has been cancelled') ||
    (now < task.startDate && "task hasn't started") ||
    (task.endDate <= now && 'task has ended') ||
    (!isPublic && walletAddress !== task.promoter && 'task is assigned to someone else') ||
    (isPublic && !isPositiveInt(userId) && 'invalid user id');

  const canFulfillTask = !error;

  const fulfillTask = (id) => {
    // let userId = isPublic ? userId : task.promoterUserId;
    if (isPublic) signContract.fulfillPublicTask(id, userId).then(handleTx).then(updateTasks).catch(handleTxError);
    else signContract.fulfillTask(id).then(handleTx).then(updateTasks).catch(handleTxError);
  };
  // console.log(task);

  // console.log(task.startDate < now, now < task.endDate, isPublic || walletAddress === task.promoter, task.status == 1);

  const checkFulfill = async () => {
    let result = await EAService.getResult(task, walletAddress, userId);
    console.log('Result', result);

    const responseStatus = result.data.responseStatus;
    const score = result.score;

    if (responseStatus === 2) alert('There was a mistake in processing your request. Please try again later.', 'error');

    if (responseStatus === 0) alert('We have not found any post matching the task requirements.', 'warning');

    if (responseStatus === 1) {
      alert(
        `We have found a matching post! Your current score is ${score}, depending on the requirements, you might be eligible for rewards.`,
        'success'
      );
    }
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
          text={
            ethers.utils.formatEther(task.depositAmount).toString() +
            ' ' +
            tokenWhitelistAddressToSymbol[task.erc20Token].toString()
          }
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
            <Button component={Link} to={'/task/' + taskId} style={{ width: '100%' }}>
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
            <LabelWith label="Summary" placement="top">
              <Box style={{ textAlign: 'left' }}>{taskSummary}</Box>
            </LabelWith>
            {/* <LabelWith placement="top" label="Reward">
              {rewardInfo}
            </LabelWith> */}
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
          <Snackbar open={alertState.open} autoHideDuration={6000} onClose={handleAlertClose}>
            <Alert onClose={handleAlertClose} severity={alertState.severity}>
              {alertState.message}
            </Alert>
          </Snackbar>
        </Fragment>
      )}
    </Column>
  );
};
