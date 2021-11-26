import { ethers } from 'ethers';
const ID_TO_CHAINNAME_SHORT = {
  1: 'ethereum',
  3: 'ropsten',
  4: 'rinkeby',
  42: 'kovan',
  137: 'polygon',
  56: 'binance',
  43114: 'avax',
  43113: 'fuji',
};

// using ethers.providers.getNetwork(chainId).name for now
const ID_TO_CHAINNAME_LONG = {
  1: 'Ethereum Mainnet',
  3: 'Ropsten Testnet',
  4: 'Rinkeby Testnet',
  42: 'Kovan Testnet',
  137: 'Polygon Network',
  56: 'Binance Smartchain',
  43114: 'Avalanche Network',
  43113: 'Avalanche Fuji Testnet',
};

const blockExplorerURLs = {
  1: 'https://etherscan.io/tx/',
  3: 'https://ropsten.etherscan.io/tx/',
  4: 'https://rinkeby.etherscan.io/tx/',
  42: 'https://kovan.etherscan.io/tx/',
  137: 'https://polygonscan.com/tx/',
  43113: 'https://testnet.snowtrace.io/tx/',
};

export const getChainName = (chainId) =>
  ID_TO_CHAINNAME_SHORT[chainId] || ID_TO_CHAINNAME_SHORT[ethers.BigNumber.from(chainId).toNumber()];

export const getChainNameLong = (chainId) =>
  ID_TO_CHAINNAME_LONG[chainId] || ID_TO_CHAINNAME_LONG[ethers.BigNumber.from(chainId).toNumber()];

export const getTransactionLink = (txHash, chainId) => {
  return (blockExplorerURLs[chainId] ?? 'transaction: ') + txHash;
};
