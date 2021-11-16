const ID_TO_CHAINNAME_SHORT = {
  1: 'ethereum',
  3: 'ropsten',
  4: 'rinkeby',
  42: 'kovan',
  137: 'polygon',
  56: 'binance',
  43114: 'avax',
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
};

const blockExplorerURLs = {
  1: 'https://etherscan.io/tx/',
  3: 'https://ropsten.etherscan.io/tx/',
  4: 'https://rinkeby.etherscan.io/tx/',
  42: 'https://kovan.etherscan.io/tx/',
  137: 'https://polygonscan.com/tx/',
};

export const getChainName = (chain) => ID_TO_CHAINNAME_SHORT[chain];
export const getChainNameLong = (chain) => ID_TO_CHAINNAME_LONG[chain];

export const getTransactionLink = (txHash, chainId) => {
  return (blockExplorerURLs[chainId] ?? 'transaction: ') + txHash;
};
