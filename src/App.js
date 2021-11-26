import './App.css';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Web3Connector, WalletConnector, TokenConnector } from './components/context/context';
import { TaskConnector, TaskContext } from './components/context/TaskContext';
import Home from './components/Home';
import { useMoralis } from 'react-moralis';
import { useEffect } from 'react';

const theme = createTheme({
  palette: {
    type: 'light',
    primary: {
      main: '#8860d0',
      // main: '#f7f7f7',
    },
    secondary: {
      main: '#e4bb00',
    },
    disabled: '#9e9e9e',
    subtle: '#747474',
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 1040, // default: 900
      lg: 1510, // default: 1200,
      xl: 1536,
    },
  },
  // palette: {
  //   // mode: 'dark',
  //   // primary: {
  //   //   main: '#dfe1ef',
  //   // },
  //   // secondary: {
  //   //   // main: '#481c07',
  //   //   main: '#fff',
  //   // },
  // },
});

function App() {
  const { isWeb3Enabled, enableWeb3, isAuthenticated, isWeb3EnableLoading } = useMoralis();

  useEffect(() => {
    if (isAuthenticated && !isWeb3Enabled && !isWeb3EnableLoading) enableWeb3();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isWeb3Enabled]);

  return (
    <ThemeProvider theme={theme}>
      <Web3Connector>
        <TaskConnector>
          <WalletConnector>
            <TokenConnector>
              <Home />
            </TokenConnector>
          </WalletConnector>
        </TaskConnector>
      </Web3Connector>
    </ThemeProvider>
  );
}

export default App;
