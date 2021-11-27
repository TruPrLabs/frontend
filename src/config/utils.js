import { ethers } from 'ethers';
import { Twitter } from '@mui/icons-material';
const icons = {
  Twitter: Twitter,
};

// const objectMap = (obj, fn) => Object.fromEntries(Object.entries(obj).map(([k, v], i) => [k, fn(v, k, i)]));

export const reverseLookup = (obj) => Object.fromEntries(Object.entries(obj).map(([k, v]) => [v, k]));

export const copyAddKeyValue = (obj, key, value) => {
  var objCopy = { ...obj };
  objCopy[key] = value;
  return objCopy;
};

export const isPositiveInt = (amt, includingZero = false) => {
  try {
    if (includingZero) return ethers.BigNumber.from(amt) >= 0;
    else return ethers.BigNumber.from(amt) > 0;
  } catch (e) {
    return false;
  }
};

export const isValidAddress = (address) => {
  try {
    return ethers.utils.defaultAbiCoder.encode(['address'], [address]) !== ethers.constants.AddressZero;
  } catch (e) {
    return false;
  }
};

export const shortenAddress = (address) => {
  return address.slice(0, 6) + '...' + address.slice(38);
};

export const formatDuration = (delta, none = 'None') => {
  if (parseInt(delta) === 0) return none;

  const time = parseInt(delta / 1000, 10);

  const days = Math.floor(time / (24 * 60 * 60));
  const hours = Math.floor((time - days * 24 * 60 * 60) / (60 * 60));
  const minutes = Math.floor((time - hours * (60 * 60)) / 60);
  const seconds = time - hours * (60 * 60) - minutes * 60;

  if (days > 0) return days + ' day' + (days !== 1 ? 's' : '');
  if (hours > 0) return hours + ' hour' + (hours !== 1 ? 's' : '');
  if (minutes > 0) return minutes + ' minute' + (minutes !== 1 ? 's' : '');
  return seconds + ' second' + (seconds !== 1 ? 's' : '');
};

export const taskTimeDeltaInfo = (task) => {
  const now = new Date().getTime();
  if (now <= task.startDate) return 'Starts in ' + formatDuration(task.startDate - now);
  if (task.endDate <= now) return 'Ended ' + formatDuration(now - task.endDate) + ' ago';
  return formatDuration(task.endDate - now) + ' left!';
};
export const clamp = (num, min, max) => (num <= min ? min : num >= max ? max : num);

export const getProgressValue = (task) => {
  const val = Math.round(((new Date() - task.startDate) / (task.endDate - task.startDate)) * 100);
  return val > 100 ? 100 : val;
};

export const getIcon = (icon) => {
  const DynamicIcon = icons[icon];
  let extra = {};
  if (icon === 'Twitter') {
    extra = {
      padding: '8px',
      borderRadius: '50%',
      background: '#54b2f5',
      color: 'white',
      marginLeft: '1em',
      height: '40px',
      width: 'auto',
    };
  }
  return <DynamicIcon style={{ display: 'inline-block', verticalAlign: 'middle', ...extra }} />;
};

export const getReadableDate = (d) => {
  return d.getDate() + '-' + (d.getMonth() + 1) + '-' + d.getFullYear();
};

export const getTaskState = (task) => {
  if (task.status === 0) return 'Cancelled';
  if (new Date().getTime() < task.endDate) return 'Open';
  if (task.balance === 0) return 'Finished';
  return 'Expired';
};
