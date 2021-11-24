import './connector.css';
import { createContext, useMemo, useEffect, useState, useContext, useCallback } from 'react';
import { Snackbar, Button, Link } from '@mui/material';
import MuiAlert from '@mui/material/Alert';

import { ethers } from 'ethers';

import { Web3Context } from './Web3Context';
import { getTransactionLink } from '../../config/chainIds';

const getProvider = () => {
  if (window.ethereum) {
    return new ethers.providers.Web3Provider(window.ethereum);
  }
};

export const WalletConnectButton = () => {
  const { walletAddress, requestAccount } = useContext(WalletContext);

  const addressInfo = walletAddress
    ? walletAddress.substring(0, 6) + '...' + walletAddress.substring(38)
    : 'Connect Wallet';

  return (
    <Button className="wallet-button" variant="outlined" onClick={requestAccount}>
      {addressInfo}
    </Button>
  );
};

export const TransactionLink = ({ txHash, message }) => {
  const { chainId } = useContext(Web3Context);
  return (
    <Link href={getTransactionLink(txHash, chainId)} target="_blank" rel="noreferrer">
      {message}
    </Link>
  );
};

const parseTxError = (e) => {
  // console.error('error', e);
  try {
    return JSON.parse(/\(error=(.+), method.+\)/g.exec(e.message)[1]).message;
  } catch (error) {
    return e?.message;
  }
};

export const WalletContext = createContext({
  walletAddress: '',
  walletProvider: undefined,
  isConnected: undefined,
  signContract: undefined,
  requestAccount: undefined,
});

export const WalletConnector = ({ children }) => {
  const { contract, userValidChainId, setChainId } = useContext(Web3Context);

  const [provider, setProvider] = useState(null);
  const [address, setAddress] = useState(null);
  const [signContract, setSignContract] = useState(null);

  const [isSendingTx, setIsSendingTx] = useState(false);

  const [alertState, setAlertState] = useState({
    open: false,
    message: '',
    severity: undefined,
  });

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

  // ------- handle transactions --------

  const handleTxError = useCallback(
    (e) => {
      setIsSendingTx(false);
      if (e.reason === 'sending a transaction requires a signer') {
        if (!userValidChainId) alert('Please switch to a valid network');
        else alert('Please connect your wallet');
      } else {
        alert(parseTxError(e));
      }
    },
    [userValidChainId]
  );

  const handleTx = useCallback(async (tx) => {
    setIsSendingTx(true);
    alert(<TransactionLink txHash={tx.hash} message="Processing Transaction" />, 'info');
    const receipt = await tx.wait();
    alert(<TransactionLink txHash={receipt.transactionHash} message="Transaction successful!" />, 'success');
    setIsSendingTx(false);
    return receipt;
  }, []);

  // ------- handle accounts --------

  const updateAccounts = (accounts) => {
    if (accounts?.length > 0) setAddress(ethers.utils.getAddress(accounts?.[0]));
  };

  const requestAccount = (ctx) => {
    if (provider) provider.send('eth_requestAccounts').then(updateAccounts).catch(handleTxError);
    else alert('Please install Metamask');
  };

  const isConnected = address && userValidChainId;

  // ------- init --------

  useMemo(() => {
    setProvider(getProvider());
    if (window.ethereum) {
      // add account listener
      window.ethereum.on('accountsChanged', (accounts) => {
        updateAccounts(accounts);
      });
      // add network listener
      window.ethereum.on('chainChanged', (chainId) => {
        // setProvider(getProvider());
        setChainId(chainId.toString());
      });
    }
  }, [setChainId]);

  useEffect(() => {
    if (provider) {
      setSignContract(contract.connect(isConnected ? provider.getSigner() : null));
      provider
        .getNetwork()
        .then((network) => setChainId(network?.chainId?.toString()))
        .catch(handleTxError);
      provider.send('eth_accounts').then(updateAccounts).catch(handleTxError);
    }
  }, [provider, contract, handleTxError, isConnected]);

  const context = {
    walletAddress: address,
    walletProvider: provider,
    isConnected: isConnected,
    signContract: signContract,
    requestAccount: requestAccount,
    handleTx: handleTx,
    handleTxError: handleTxError,
    isSendingTx: isSendingTx,
  };

  return (
    <WalletContext.Provider value={context}>
      {children}
      <Snackbar open={alertState.open} autoHideDuration={6000} onClose={handleAlertClose}>
        <MuiAlert onClose={handleAlertClose} severity={alertState.severity}>
          {alertState.message}
        </MuiAlert>
      </Snackbar>
    </WalletContext.Provider>
  );
};
