import { ethers } from 'ethers';
import { reverseLookup } from './utils';
import { useMoralis } from 'react-moralis';

const { abi: ERC20ABI } = require('../contracts/ERC20.json');
export const contractABI = require('../contracts/TruPr.json').abi;

// ---------- config -----------

// export const VALID_CHAIN_IDS = ['42', '4'];
export const VALID_CHAIN_IDS = ['42'];

const contractAddressKovan = '0x70E883b0272602E49Dfb996d7d9808fB8DD83394';
const contractAddressFuji = '';
const mockToken1Kovan = '0xf912570039238431e13D24d01767d5920C821e58';
const mockToken2Kovan = '0xD7eD0F05085f48F4a8D5dF0Ac09bB2c3DA7D403c';

const contractAddress = {
  rinkeby: '0xD22460D669B37b90fB5b1bC1855b2E43084CFb3D',
  kovan: contractAddressKovan,
  fuji: contractAddressFuji,
};

const whitelist = [
  { address: { kovan: mockToken1Kovan }, name: 'MockToken', symbol: 'MOCK' },
  {
    address: { kovan: mockToken2Kovan },
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
//const web3ProviderFuji = new ethers.providers

// ---------- exports -----------

export const getContractAddress = (chainName) => {
  return contractAddress[chainName];
};

export const getContract = (chainName) => {
  const contractAddress = getContractAddress(chainName);
  const web3Provider = getProvider(chainName);
  return new ethers.Contract(contractAddress, contractABI, web3Provider);
};

export const getProvider = (chainName) => {
  if (chainName === 'rinkeby') return web3ProviderRinkeby;
  if (chainName === 'kovan') return web3ProviderKovan;
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

export const DEFAULT_CHAIN_ID = VALID_CHAIN_IDS[0];

export const isValidChainId = (chainId) => VALID_CHAIN_IDS.includes(chainId);

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
