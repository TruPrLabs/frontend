import { useState, createContext, useContext } from 'react';
import { Button } from '@mui/material';

import { getChainName, getChainNameLong } from '../../config/chainIds';
import {
  DEFAULT_CHAIN_ID,
  isValidChainId,
  getProvider,
  getContract,
  getWhitelistAddressToSymbol,
  getErc20TokenWhitelist,
} from '../../config/config';

export const Web3Context = createContext({});

export const Web3Connector = ({ children }) => {
  const [chainId, setChainId] = useState(DEFAULT_CHAIN_ID);
  const [userChainId, setUserChainId] = useState(DEFAULT_CHAIN_ID);

  const userValidChainId = isValidChainId(userChainId);

  const chainName = getChainName(chainId);
  const web3Provider = getProvider(chainName);
  const contract = getContract(chainName);

  const tokenWhitelist = getErc20TokenWhitelist(chainName, web3Provider);
  const tokenWhitelistAddressToSymbol = getWhitelistAddressToSymbol(chainName);

  const setChainIdWrapper = (id) => {
    setUserChainId(id);
    if (isValidChainId(id)) setChainId(id);
  };

  const context = {
    contract: contract,
    web3Provider: web3Provider,
    chainName: chainName,
    chainId: chainId,
    userValidChainId: userValidChainId,
    setChainId: setChainIdWrapper,
    tokenWhitelist: tokenWhitelist,
    tokenWhitelistAddressToSymbol: tokenWhitelistAddressToSymbol,
  };

  window.contract = contract; // XXX: REMOVE THIS!!!!

  return (
    <Web3Context.Provider value={context}>
      {!userValidChainId && (
        <div className="invalid-network-banner">
          Warning: connected to {getChainNameLong(userChainId) || 'unknown network'}. Please switch to
          {' ' + getChainNameLong(DEFAULT_CHAIN_ID)}.
        </div>
      )}
      {children}
    </Web3Context.Provider>
  );
};

export const NetworkButton = () => {
  const { chainName } = useContext(Web3Context);
  return (
    <Button className="network-button" variant="outlined">
      {chainName}
    </Button>
  );
};
