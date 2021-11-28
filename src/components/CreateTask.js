import React, { Fragment } from 'react';
import { useState, useContext, useEffect } from 'react';
import {
  Stack,
  Checkbox,
  MenuItem,
  Button,
  Stepper,
  StepLabel,
  Tooltip,
  Table,
  TableContainer,
  TableBody,
  TableRow,
  TableCell,
  TextField,
  Step,
  StepButton,
  Typography,
} from '@mui/material';
import {
  Column,
  StyledTextField,
  DDateTimePicker,
  Row,
  LabelWith,
  LabelWithText,
  RowLabel,
  TransactionButton,
} from '../config/defaults';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'markdown-to-jsx';

// import useWindowDimensions from '../hooks/useWindowDimensions';
import Confetti from 'react-confetti';
import { useNewMoralisObject, useMoralis, useMoralisQuery } from 'react-moralis';
import { useMoralisDapp } from '../providers/MoralisDappProvider/MoralisDappProvider';
import TwitterService from '../services/twitter';

import AdapterDateFns from '@mui/lab/AdapterDateFns';
import LocalizationProvider from '@mui/lab/LocalizationProvider';

import { ethers } from 'ethers';

import { TokenContext, WalletContext, Web3Context } from './context/context';

import { PLATFORM_TO_ID, DURATION_CHOICES, METRIC_TO_ID } from '../config/config';
import { isPositiveInt, isValidAddress, formatDuration } from '../config/utils';
import { Box } from '@mui/system';
import { getReadableTaskSummary } from './Task';

const steps = ['Description', 'Details', 'Rewards', 'Finalize'];

// ================== Create Task ====================

export const CreateTask = () => {
  const { isSaving, save } = useNewMoralisObject('Task');
  const { refetchUserData, setUserData, userError, isUserUpdating, user, isAuthUndefined } = useMoralis();
  const { walletAddress } = useMoralisDapp();

  // console.log('rendering', 'Create')
  const [activeStep, setActiveStep] = useState(0);

  const [platform, setPlatform] = useState('Twitter');
  const [promoter, setPromoterAddress] = useState('');
  const [promoterUserId, setPromoterUserId] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [message, setMessage] = useState('');
  const [description, setDescription] = useState('');
  const [title, setTitle] = useState('');

  const [tokenSymbol, setTokenSymbol] = useState('REACH');
  const [depositAmount, setDepositAmount] = useState('0');
  const [startDate, setStartDate] = useState(new Date().getTime());
  const [endDate, setEndDate] = useState(new Date().getTime() + DURATION_CHOICES['One Week']);
  const [metric, setMetric] = useState('Time');
  const [milestone, setMilestone] = useState('');
  const [cliffPeriod, setCliffPeriod] = useState(0);
  const [linearRate, setLinearRate] = useState(true);
  // const [xticks, setXticks] = useState([]);
  // const [yticks, setYticks] = useState([]);

  const [touched, setTouched] = useState({});
  const isTouched = (key) => Object.keys(touched).includes(key);

  const [isSendingTxApprove, setIsSendingTxApprove] = useState(false);
  const [isSendingTxTask, setIsSendingTxTask] = useState(false);
  const [createdTaskId, setCreatedTaskId] = useState(-1);

  const [confetti, setConfetti] = useState(false);
  const [confettiRunning, setConfettiRunning] = useState(false);

  const { tokenApprovals, tokenBalances, tokenBalancesFormatted, updateApprovals } = useContext(TokenContext);
  const { handleTx, handleTxError, signContract, walletProvider } = useContext(WalletContext);
  const { tokenWhitelist, contract } = useContext(Web3Context);

  // const { width, height } = useWindowDimensions();

  // const handleTx = handleTxWrapper(() => {});
  const token = tokenWhitelist[tokenSymbol];

  const data = JSON.stringify({
    platform: platform,
    userId: promoterUserId,
    metric: metric,
    endpoint: isPublic ? 'Public' : 'UserTimeline',
    messageHash: ethers.utils.keccak256(ethers.utils.defaultAbiCoder.encode(['string'], [message.trim()])),
  });

  if (isAuthUndefined) {
    return <div>loading</div>;
  }

  // parsing functions

  const isValidMessage = message !== '';
  const isValidPromoter = isValidAddress(promoter) && promoter.toLowerCase() !== walletAddress.toLowerCase();
  const isValidPromoterUserId = isPositiveInt(promoterUserId);
  const isValidStartDate = new Date() <= startDate;
  const isValidEndDate = startDate <= endDate;
  const isValidDepositAmount =
    tokenBalances[tokenSymbol] &&
    isPositiveInt(depositAmount) &&
    ethers.utils.parseEther(depositAmount).lte(tokenBalances[tokenSymbol]);
  const isValidMilestone = isPositiveInt(milestone, true);

  // console.log(
  //   'checking ',
  //   isPositiveInt(depositAmount),
  //   ethers.utils.parseEther(depositAmount),
  //   tokenBalances[tokenSymbol],
  //   ethers.utils.parseEther(depositAmount) <= tokenBalances[tokenSymbol]
  // );

  const errorForm1 = (!isValidMessage && 'Invalid message given') || '';
  const errorForm2 =
    (!isPublic && !isValidPromoter && 'Invalid promoter address given') ||
    (!isPublic && !isValidPromoterUserId && 'Invalid user id given') ||
    '';

  const errorForm3 =
    (!isValidEndDate && 'Invalid end date given') ||
    (!isValidDepositAmount && 'Invalid deposit amount given') ||
    (!isValidMilestone && 'Invalid milestone given') ||
    '';

  const formError = (index) => {
    if (index === 0) return errorForm1;
    if (index === 1) return errorForm2;
    if (index === 2) return errorForm3;
    if (index === 3)
      return (
        (errorForm1 && 'Step 1: ' + errorForm1) ||
        (errorForm2 && 'Step 2: ' + errorForm2) ||
        (errorForm3 && 'Step 3: ' + errorForm3) ||
        ''
      );
  };

  const approveToken = () => {
    token.contract
      .connect(walletProvider.getSigner())
      .approve(contract.address, ethers.constants.MaxUint256)
      .then((tx) => {
        setIsSendingTxApprove(true);
        return tx;
      })
      .then(handleTx)
      .then((tx) => {
        setIsSendingTxApprove(false);
        return tx;
      })
      .then(() => updateApprovals(tokenSymbol))
      .catch((e) => {
        handleTxError(e);
        setIsSendingTxApprove(false);
      });
  };

  const getTask = () => ({
    promoter: isPublic ? ethers.constants.AddressZero : promoter,
    tokenAddress: token.address,
    depositAmount: ethers.utils.parseEther(depositAmount),
    startDate: parseInt(startDate.toString() / 1000).toString(),
    endDate: parseInt(endDate.toString() / 1000).toString(),
    cliffPeriod: parseInt(cliffPeriod.toString() / 1000).toString(),
    linearRate: linearRate.toString(),
    xticks: [milestone],
    yticks: [depositAmount].map((amount) => ethers.utils.parseEther(amount)),
    data: data,
  });

  const createTask = () => {
    const task = getTask();

    console.log('creating task', task);
    // let parsedAmount = ethers.utils.parseEther(task.depositAmount);

    signContract
      .createTask(
        task.promoter,
        task.tokenAddress,
        task.depositAmount,
        // parsedAmount,
        task.startDate,
        task.endDate,
        task.cliffPeriod,
        task.linearRate,
        task.xticks,
        task.yticks,
        task.data
      )
      .then((tx) => {
        setIsSendingTxTask(true);
        return tx;
      })
      .then(handleTx)
      .then((receipt) => {
        setIsSendingTxTask(false);
        startParty();

        let taskId = receipt.events.at(-1).args.taskId.toString();
        setCreatedTaskId(taskId);

        const moralisDBTask = {
          ...task,
          taskId: taskId,
          title: title,
          message: message,
          description: description,
          message: message,
          type: isPublic ? 'Public' : 'Personal',
          user: user,
        };

        save(moralisDBTask);
      })
      .then(() => updateApprovals(tokenSymbol))
      .catch((e) => {
        setIsSendingTxTask(false);
        handleTxError(e);
      });
  };

  const touch = (key) => {
    var t = touched;
    t[key.toString()] = true;
    setTouched(t);
  };

  const handleStep = (step) => {
    touch('step' + activeStep);
    setActiveStep(step);
  };

  const nextStep = () => {
    handleStep(activeStep + 1);
  };
  const previousStep = () => {
    handleStep(activeStep - 1);
  };

  const startParty = () => {
    setConfetti(true);
    setConfettiRunning(true);
    setTimeout(() => setConfetti(false), 800);
  };

  window.startParty = startParty;

  const taskSummary = getReadableTaskSummary(
    startDate,
    endDate,
    platform,
    isPublic,
    promoterUserId,
    isValidDepositAmount && ethers.utils.parseEther(depositAmount),
    tokenSymbol,
    metric,
    milestone,
    linearRate,
    cliffPeriod
  );

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Confetti numberOfPieces={200} run={confettiRunning} recycle={confetti} gravity={0.1} />
      <Column>
        <Stepper nonLinear activeStep={activeStep}>
          {steps.map((label, index) => (
            <Step key={label} completed={!formError(index)}>
              <Tooltip title={formError(index)} placement="top">
                <StepButton color="inherit" onClick={() => handleStep(index)}>
                  <StepLabel
                    error={index !== activeStep && index !== 3 && isTouched('step' + index) && !!formError(index)}
                  >
                    {label}
                  </StepLabel>
                </StepButton>
              </Tooltip>
            </Step>
          ))}
        </Stepper>
        {activeStep === 0 && (
          <Fragment>
            <RowLabel label="Enter the title of your promotion." placement="top">
              <StyledTextField
                label="Title"
                style={{ width: '100%', height: 'auto' }}
                value={title}
                onChange={({ target }) => {
                  setTitle(target.value);
                }}
              />
            </RowLabel>
            <RowLabel
              label="Enter your promotion description."
              tooltip="You can describe who you are, what your goals are, what target group you're aiming for etc."
              placement="top"
            >
              <StyledTextField
                multiline
                style={{ width: '100%', height: 'auto' }}
                label="Description"
                value={description}
                onChange={({ target }) => {
                  setDescription(target.value);
                }}
              />
            </RowLabel>
            {/* </Row> */}
            {/* <Row> */}
            <RowLabel
              label="Enter the exact mesage for the promotion."
              tooltip="The exact message the promoter must relay. The promoter will not be able to complete the task if the message does not match exactly."
              placement="top"
            >
              <StyledTextField
                multiline
                style={{ width: '100%', height: 'auto' }}
                label="Message"
                value={message}
                error={isTouched('message') && !isValidMessage}
                helperText={isTouched('message') && !isValidMessage && 'Enter a valid message'}
                onChange={({ target }) => {
                  touch('message');
                  setMessage(target.value);
                }}
              />
            </RowLabel>
          </Fragment>
        )}
        {activeStep === 1 && (
          <Fragment>
            <RowLabel
              label="Choose the platform."
              tooltip="This is the platform the promoter will use to complete the task on."
            >
              <StyledTextField
                select
                label="Platform"
                value={platform}
                onChange={({ target }) => {
                  setPlatform(target.value);
                }}
              >
                {Object.entries(PLATFORM_TO_ID).map(([platformName, platformId]) => (
                  <MenuItem key={platformId} value={platformId}>
                    {platformName}
                  </MenuItem>
                ))}
              </StyledTextField>
            </RowLabel>
            {/* </Row> */}
            <RowLabel
              label="Will this be a public or a personalised task?"
              tooltip="Having a personalised task means that only a specific user can fulfill this task. Public means that anyone can fulfill the task and claim the rewards."
            >
              <LabelWith
                style={{ width: 250, justifyContent: 'center', marginLeft: 'auto' }}
                label="Public"
                placement="right"
                variant="subtle"
              >
                <Checkbox checked={isPublic} onChange={({ target }) => setIsPublic(target.checked)} />
              </LabelWith>
            </RowLabel>
            <div style={{}}>
              <RowLabel
                label="Enter the promoter's wallet address."
                tooltip="This is the address that will receive the tokens after the task has been fulfilled"
                variant={isPublic ? 'subtle' : 'standard'}
              >
                <StyledTextField
                  label="Promoter Address"
                  disabled={isPublic}
                  value={isPublic ? '' : promoter}
                  error={!isPublic && isTouched('promoter') && !isValidPromoter}
                  helperText={
                    !isPublic &&
                    isTouched('promoter') &&
                    !isValidPromoter &&
                    ((!isValidAddress(promoter) && 'Enter a valid address') ||
                      'Address must differ from wallet address')
                  }
                  onChange={({ target }) => {
                    touch('promoter');
                    setPromoterAddress(target.value);
                  }}
                />
              </RowLabel>
            </div>
            <RowLabel
              disabled={isPublic}
              label={`Enter the promoter's ${platform} user id.`}
              tooltip="This is the user id of the promoter's account on the specified social network platform"
              variant={isPublic ? 'subtle' : 'standard'}
            >
              <StyledTextField
                label="Promoter User Id"
                disabled={isPublic}
                value={isPublic ? '' : promoterUserId}
                error={!isPublic && isTouched('promoterUserId') && !isValidPromoterUserId}
                helperText={
                  !isPublic && isTouched('promoterUserId') && !isValidPromoterUserId && 'Enter a valid User Id'
                }
                onChange={({ target }) => {
                  touch('promoterUserId');
                  setPromoterUserId(target.value);
                }}
              />
            </RowLabel>
            <RowLabel
              label="Enter the start and end date for the promotion."
              tooltip="The time frame the promoter will be given to fulfill his task. If the task is fulfilled in this time window, the promoter will still be able to get paid, even after the end date."
              placement="top"
            >
              <Row style={{ marginTop: '1em' }}>
                <DDateTimePicker
                  sx={{ marginLeft: 0 }}
                  label="Start Date"
                  value={startDate}
                  onChange={(newDate) => {
                    touch('startDate');
                    setStartDate(newDate.getTime());
                  }}
                  error={isTouched('startDate') && !isValidStartDate}
                  helperText={isTouched('startDate') && !isValidStartDate && 'Start date is in the past'}
                />
                <DDateTimePicker
                  label="End Date"
                  value={endDate}
                  onChange={(newDate) => {
                    touch('endDate');
                    setEndDate(newDate.getTime());
                  }}
                  error={isTouched('endDate') && !isValidEndDate}
                  helperText={isTouched('endDate') && !isValidEndDate && 'End date must be after start date'}
                />
              </Row>
            </RowLabel>
          </Fragment>
        )}
        {activeStep === 2 && (
          <Fragment>
            <RowLabel
              label="What is the reward for this task?"
              tooltip="The token and the amount to be paid out to the promoter upon fulfilling the task"
              // placement="top"
            >
              <div style={{ display: 'inline-flex', marginLeft: 'auto' }}>
                <StyledTextField
                  label="Amount"
                  style={{ width: 130, marginRight: '1em' }}
                  value={depositAmount}
                  error={isTouched('depositAmount') && (!isPositiveInt(depositAmount) || !isValidDepositAmount)}
                  helperText={
                    isTouched('depositAmount') &&
                    ((!isPositiveInt(depositAmount) && 'Invalid amount') ||
                      (!isValidDepositAmount && 'Amount exceeds balance'))
                  }
                  onChange={({ target }) => {
                    touch('depositAmount');
                    setDepositAmount(target.value);
                  }}
                />
                <StyledTextField
                  select
                  label="Token"
                  value={tokenSymbol}
                  onChange={({ target }) => {
                    setTokenSymbol(target.value);
                  }}
                >
                  {Object.entries(tokenWhitelist).map(([symbol, _token]) => (
                    <MenuItem key={symbol} value={symbol}>
                      {symbol + ' (balance: ' + tokenBalancesFormatted[symbol] + ')'}
                    </MenuItem>
                  ))}
                </StyledTextField>
              </div>
            </RowLabel>
            <RowLabel
              label="Enter the metric to be tracked."
              tooltip="The metric the promoter will be evaluated on for their payout. Setting this to 'Time' means the promoter will get paid out over time once the task is complete."
            >
              <StyledTextField
                select
                label="Metric"
                value={metric}
                onChange={({ target }) => {
                  setMetric(target.value);
                }}
              >
                {Object.entries(METRIC_TO_ID).map(([choice, time]) => (
                  <MenuItem key={time} value={choice}>
                    {time}
                  </MenuItem>
                ))}
              </StyledTextField>
            </RowLabel>

            <RowLabel
              label="Enter the milestone the promoter must reach."
              tooltip="If this is set to `100` and the metric is `likes`, the promoter will receive their payout upon reaching this milestone."
            >
              <StyledTextField
                label="Milestone"
                // style={{ width: 130, marginRight: '1em' }}
                value={milestone}
                error={isTouched('milestone') && !isValidMilestone}
                helperText={isTouched('milestone') && !isValidMilestone && 'Must be non-negative integer'}
                onChange={({ target }) => {
                  touch('milestone');
                  setMilestone(target.value);
                }}
              />
            </RowLabel>

            <RowLabel
              label="Should the rewards be given out gradually?"
              tooltip="The payout will be linearly interpolated between the values."
            >
              <LabelWith
                style={{ width: 250, marginLeft: 'auto', justifyContent: 'center' }}
                label="Linear rate"
                placement="right"
                variant="subtle"
              >
                <Checkbox checked={linearRate} onChange={({ target }) => setLinearRate(target.checked)} />
              </LabelWith>
            </RowLabel>

            <RowLabel
              label="Should there be a cliff-period?"
              tooltip="The cliff-priod determines a delay in the payout. The fulfillment of the task must have passed the cliff-period before the promoter is able to be paid out."
            >
              <StyledTextField
                select
                label="Cliff Period"
                value={cliffPeriod}
                onChange={({ target }) => {
                  setCliffPeriod(target.value);
                }}
              >
                {Object.entries(DURATION_CHOICES).map(([choice, time]) => (
                  <MenuItem key={time} value={time}>
                    {choice}
                  </MenuItem>
                ))}
              </StyledTextField>
            </RowLabel>
          </Fragment>
        )}
        {activeStep === 3 && (
          <Fragment>
            {/* <TableContainer>
              <Table>
                <TableBody>
                  {Object.entries(getTaskReadable()).map(([key, value]) => (
                    <TableRow key={key}>
                      <TableCell>{key}</TableCell>
                      <TableCell>{value.toString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer> */}
            <LabelWithText
              // textStyle={{ fontWeight: 200 }}
              label="Title"
              text={title || '[No title given]'}
              placement="top"
            />
            <LabelWithText label="Description" text={description || '[No description given]'} placement="top" />
            <LabelWith label="Summary" placement="top">
              <Box style={{ textAlign: 'left' }}>{taskSummary}</Box>
            </LabelWith>
            <Fragment>
              {!tokenApprovals[tokenSymbol] && (
                <Row>
                  <TransactionButton loading={isSendingTxApprove} onClick={approveToken}>
                    Approve Token
                  </TransactionButton>
                </Row>
              )}
              {createdTaskId >= 0 ? (
                <Row>
                  <Button style={{ width: '100%' }} component={Link} to={'/task/' + createdTaskId}>
                    View Task
                  </Button>
                </Row>
              ) : (
                // Why Stack instead of Row here?
                <Stack>
                  <TransactionButton
                    tooltip={formError(3)}
                    loading={isSendingTxTask}
                    disabled={!!formError(3) || !tokenApprovals[tokenSymbol]}
                    onClick={createTask}
                    // style={{ cursor: 'not-allowed' }} //help
                  >
                    Create Task
                  </TransactionButton>
                </Stack>
              )}
            </Fragment>
          </Fragment>
        )}
        <Row>
          <Button disabled={activeStep === 0} style={{ marginRight: 'auto' }} onClick={previousStep}>
            BACK
          </Button>
          <Button disabled={activeStep === 3} style={{ marginLeft: 'auto' }} onClick={nextStep}>
            NEXT
          </Button>
        </Row>
      </Column>
      <DevTools />
    </LocalizationProvider>
  );
};

// const FinalForm = (task) => {
//   return
//             <TableContainer>
//               <Table>
//                 <TableBody>
//                   {Object.entries(task).map(([key, value]) => (
//                     <TableRow key={key}>
//                       <TableCell>{key}</TableCell>
//                       <TableCell>{value.toString()}</TableCell>
//                     </TableRow>
//                   ))}
//                 </TableBody>
//               </Table>
//             </TableContainer>

// }

// ================== Dev Tools ====================

const mockMintInterface = ['function mint(uint256 amount)', 'function mintFor(address for, uint256 amount)'];

export const DevTools = () => {
  const [tokenSymbol, setTokenSymbol] = useState('REACH');

  const [isMinting, setIsMinting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [twitterId, setTwitterId] = useState('');

  const { tokenWhitelist } = useContext(Web3Context);
  const { tokenBalances, tokenBalancesFormatted, updateBalances } = useContext(TokenContext);
  const { handleTxError, handleTx, walletProvider, isConnected } = useContext(WalletContext);

  const token = tokenWhitelist[tokenSymbol];

  const mint = () => {
    const contract = new ethers.Contract(token.address, mockMintInterface);
    contract
      .connect(isConnected ? walletProvider.getSigner() : null)
      .mint(ethers.utils.parseEther('100'))
      .then((tx) => {
        setIsMinting(true);
        return tx;
      })
      .then(handleTx)
      .then(() => {
        setIsMinting(false);
      })
      .then(() => updateBalances(tokenSymbol))
      .catch((e) => {
        handleTxError(e);
        setIsMinting(false);
      });
  };

  return (
    <Column>
      <h2>Faucet</h2>
      <TextField
        select
        variant="outlined"
        label="Token"
        value={tokenSymbol}
        onChange={({ target }) => {
          setTokenSymbol(target.value);
        }}
      >
        {Object.entries(tokenWhitelist).map(([symbol, _token]) => (
          <MenuItem key={symbol} value={symbol}>
            {symbol + ' (balance: ' + tokenBalancesFormatted[symbol] + ')'}
          </MenuItem>
        ))}
      </TextField>
      <TransactionButton loading={isMinting} onClick={mint}>
        Mint 100
      </TransactionButton>
      <h2 style={{ marginTop: '30px', marginBottom: '15px' }}> Twitter tools</h2>
      <TextField
        label="User handle"
        value={username}
        onChange={({ target }) => {
          setUsername(target.value);
        }}
      ></TextField>{' '}
      <TransactionButton
        variant="contained"
        onClick={async () => {
          setIsLoading(true);
          let user = await TwitterService.getId({ username });
          setTwitterId(user);
          setIsLoading(false);
          console.log(twitterId);
        }}
      >
        Get user Id
      </TransactionButton>
      <strong style={{ marginTop: '20px' }}>Result: {twitterId}</strong>
    </Column>
  );
};
