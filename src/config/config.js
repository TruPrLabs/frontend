import { ethers } from 'ethers';
import { reverseLookup } from './utils';
import { useMoralis } from 'react-moralis';
require('dotenv').config();

const { abi: ERC20ABI } = require('../contracts/ERC20.json');
export const contractABI = require('../contracts/TruPr.json').abi;

// ---------- config -----------

// export const VALID_CHAIN_IDS = ['42', '4'];
export const VALID_CHAIN_IDS = [
  '42', // '42',
  '43113', // '43113'
];

// const contractAddressFuji = '0x4De81C6a43Ed7eF386Ab11B13371D1d7860f68a5';
// const mockToken1Fuji = '0x7272da389c22C8034e9C12fD0A4730F24B1bc492';
// const mockToken2Fuji = '0xf445858D4aF94A4122dD987F07CD6d778746332F';
const contractAddressFuji = '0x0c4497C76978E851Ae04Ccad0C2D4018606bB8D6';
const mockToken1Fuji = '0xbd1FB312953544b5781601048f2088C4B02DDdDb';
const mockToken2Fuji = '0x779C7d959dab9F0A96652C5c018d193B9E08303B';

// const contractAddressFuji = '0x75c9e83F219d19fdF67c89e83C9AeC5fA618cE77';
// const mockToken1Fuji = '0xE9C0962E56b723C8DE5602b054aB5F1a6C1a57d7';
// const mockToken2Fuji = '0xCBDfdF0Ba36d1A456d7ceB2cc97CBD809fD5ec85';

const contractAddressKovan = '0x70E883b0272602E49Dfb996d7d9808fB8DD83394';
const mockToken1Kovan = '0xf912570039238431e13D24d01767d5920C821e58';
const mockToken2Kovan = '0xD7eD0F05085f48F4a8D5dF0Ac09bB2c3DA7D403c';

const contractAddress = {
  rinkeby: '0xD22460D669B37b90fB5b1bC1855b2E43084CFb3D',
  kovan: contractAddressKovan,
  fuji: contractAddressFuji,
};

const whitelist = [
  { address: { kovan: mockToken1Kovan, fuji: mockToken1Fuji }, name: 'Reach', symbol: 'REACH' },
  {
    address: { kovan: mockToken2Kovan, fuji: mockToken2Fuji },
    name: 'BananaToken',
    symbol: 'BANANA',
  },
];

const web3ProviderRinkeby = new ethers.providers.AlchemyWebSocketProvider(
  'rinkeby',
  process.env.REACT_APP_ALCHEMY_KEY_RINKEBY
);
const web3ProviderKovan = new ethers.providers.AlchemyWebSocketProvider(
  'kovan',
  process.env.REACT_APP_ALCHEMY_KEY_KOVAN
);
const web3ProviderFuji = new ethers.providers.Web3Provider(window.ethereum);

// ---------- exports -----------

export const getContractAddress = (chainName) => {
  return contractAddress[chainName];
};

export const getContract = (chainName) => {
  const contractAddress = getContractAddress(chainName);
  const web3Provider = new ethers.providers.Web3Provider(window.ethereum); //getProvider(chainName);
  return new ethers.Contract(contractAddress, contractABI, web3Provider);
};

export const getProvider = (chainName) => {
  if (chainName === 'rinkeby') return web3ProviderRinkeby;
  if (chainName === 'kovan') return web3ProviderKovan;
  if (chainName === 'fuji') return web3ProviderFuji;
};

export const ID_TO_STATUS = {
  0: 'Closed',
  1: 'Open',
  2: 'Fulfilled',
};

export const ID_TO_PLATFORM = {
  Twitter: 'Twitter',
  Instagram: 'Instagram',
};

export const ID_TO_METRIC = {
  Time: 'Time',
  Likes: 'like_count',
  Retweets: 'retweet_count',
  Replies: 'reply_count',
};

export const DURATION_CHOICES = {
  None: 0,
  'One Day': 1 * 24 * 60 * 60 * 1000,
  'Three Days': 3 * 24 * 60 * 60 * 1000,
  'One Week': 1 * 7 * 24 * 60 * 60 * 1000,
  'Two Weeks': 2 * 7 * 24 * 60 * 60 * 1000,
};

export const PLATFORM_TO_ID = reverseLookup(ID_TO_PLATFORM);
export const METRIC_TO_ID = reverseLookup(ID_TO_METRIC);

export const oneWeek = 7 * 24 * 60 * 60 * 1000;

export const DEFAULT_CHAIN_ID = VALID_CHAIN_IDS[1];

export const isValidChainId = (chainId) => {
  // console.log('checking valid ', chainId);
  return VALID_CHAIN_IDS.includes(chainId) || VALID_CHAIN_IDS.includes(ethers.BigNumber.from(chainId).toString());
};
// export const isValidChainId = (chainId) =>
//   VALID_CHAIN_IDS.includes(chainId) || VALID_CHAIN_IDS[ethers.BigNumber.from(chainId).toNumber()];

export const getWhitelistAddressToSymbol = (chainName) => {
  return reverseLookup(buildDictIndexedBy(whitelist, 'symbol', (token) => token.address[chainName]));
};

const buildDictIndexedBy = (arr, key, fn) => {
  return Object.fromEntries(arr.map((entry, i) => [entry[key], fn(entry, i)]));
};

export const getErc20TokenWhitelist = (chainName, provider) => {
  return buildDictIndexedBy(whitelist, 'symbol', (token) => ({
    ...token,
    address: token.address[chainName],
    contract: new ethers.Contract(token.address[chainName], ERC20ABI, provider),
  }));
  // return buildContractsIndexedBy(whitelist, 'symbol', chainName, provider);
};
