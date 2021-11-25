import { ethers } from 'ethers';
import { reverseLookup } from './utils';
import { useMoralis } from 'react-moralis';

const { abi: ERC20ABI } = require('../contracts/ERC20.json');
export const contractABI = require('../contracts/TruPr.json').abi;

// ---------- config -----------

// export const VALID_CHAIN_IDS = ['42', '4'];
export const VALID_CHAIN_IDS = ['42'];

const contractAddressKovan = '0xdcb7Df7eB970607f6018D2bA27Bc14eF83B6AAE0';
const contractAddressFuji = '0x72f7A9140a278AC104f142069C0F2957F76bB0B3';
const mockToken1Kovan = '0x22d7f25D0B6d5892c8Cd6A5ef50cd90378E105Fc';
const mockToken2Kovan = '0x73FcE30e3c80C973241359E73DdAAffDe42BA685';

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
  Likes: 'Likes',
  Retweets: 'Retweets',
  Comments: 'Comments',
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
