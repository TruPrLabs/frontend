import { useMoralisDapp } from '../providers/MoralisDappProvider/MoralisDappProvider';
import { useMoralis } from 'react-moralis';
import { getEllipsisTxt } from '../helpers/formatters';
import Blockie from './Blockie';
import { useState } from 'react';
import Address from './Address/Address';
import { getExplorer } from '../helpers/networks';

import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import OpenInNewOutlinedIcon from '@mui/icons-material/OpenInNewOutlined';
import Link from '@mui/material/Link';

const styles = {
  account: {
    height: '42px',
    padding: '0 15px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: 'fit-content',
    cursor: 'pointer',
    border: '1rem',
    marginBlock: 'auto',
  },
  text: {
    fontFamily: 'Rubik',
  },
  modal: {
    boxShadow: 24,
    marginTop: 20,
    p: 4,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    outline: 'none',
    border: 'none',
  },
  card: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    border: 10,
  },
};

function Account() {
  const { authenticate, isAuthenticated, logout } = useMoralis();
  const { walletAddress, chainId } = useMoralisDapp();
  const [isModalVisible, setIsModalVisible] = useState(false);

  if (!isAuthenticated) {
    return (
      <div style={styles.account} onClick={() => authenticate({ signingMessage: 'Hello World!' })}>
        <p style={styles.text}>Authenticate</p>
      </div>
    );
  }

  return (
    <>
      <div style={styles.account} onClick={() => setIsModalVisible(true)}>
        <p style={{ marginRight: '5px', ...styles.text }}>{getEllipsisTxt(walletAddress, 6)}</p>
        <Blockie currentWallet scale={3} />
      </div>
      <div style={{ outline: 'none' }}>
        <Modal
          open={isModalVisible}
          onClose={() => setIsModalVisible(false)}
          style={styles.modal}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box style={{ width: '400px' }}>
            <Card
              style={{
                borderRadius: '1rem',
              }}
            >
              <CardContent>
                <Typography id="modal-modal-title" variant="h6" component="h2">
                  Account
                </Typography>
                <Address avatar="left" size={14} copyable style={{ fontSize: '20px' }} />
              </CardContent>
              <Card style={styles.card}>
                <CardActions>
                  <div style={{ padding: '10px 10px', marginBottom: 'auto' }}>
                    <OpenInNewOutlinedIcon />
                    <Link
                      href={`${getExplorer(chainId)}/address/${walletAddress}`}
                      target="_blank"
                      underline="hover"
                      rel="noreferrer"
                    >
                      View on Explorer
                    </Link>
                  </div>
                </CardActions>
              </Card>
              <CardActions>
                <Button
                  size="large"
                  type="primary"
                  style={{
                    width: '100%',
                    borderRadius: '0.5rem',
                    fontSize: '16px',
                    fontWeight: '500',
                  }}
                  onClick={() => {
                    logout();
                    setIsModalVisible(false);
                  }}
                >
                  Disconnect Wallet
                </Button>
              </CardActions>
            </Card>
          </Box>
        </Modal>
      </div>
    </>
  );
}

export default Account;
