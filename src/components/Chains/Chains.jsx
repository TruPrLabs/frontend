import { useEffect, useState } from 'react';
import useChain from '../../hooks/useChain';
import { useMoralisDapp } from '../../providers/MoralisDappProvider/MoralisDappProvider';
import { AvaxLogo, PolygonLogo, BSCLogo, ETHLogo } from './Logos';

import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';

const styles = {
  item: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'left',
    height: '42px',
    fontWeight: '500',
    fontFamily: 'Roboto, sans-serif',
    fontSize: '14px',
    padding: '0 10px',
  },
  button: {
    border: '2px solid rgb(231, 234, 243)',
    borderRadius: '12px',
  },
};

const menuItems = [
  /*{
    key: '0x1',
    value: 'Ethereum',
    icon: <ETHLogo />,
  },
  {
    key: '0x539',
    value: 'Local Chain',
    icon: <ETHLogo />,
  },
  {
    key: '0x3',
    value: 'Ropsten Testnet',
    icon: <ETHLogo />,
  },
  {
    key: '0x4',
    value: 'Rinkeby Testnet',
    icon: <ETHLogo />,
  },*/
  {
    key: '0x2a',
    value: 'Kovan',
    icon: <ETHLogo />,
  },
  /*{
    key: '0x5',
    value: 'Goerli Testnet',
    icon: <ETHLogo />,
  },
  {
    key: '0x38',
    value: 'Binance',
    icon: <BSCLogo />,
  },
  {
    key: '0x61',
    value: 'Smart Chain Testnet',
    icon: <BSCLogo />,
  },
  {
    key: '0x89',
    value: 'Polygon',
    icon: <PolygonLogo />,
  },
  {
    key: '0x13881',
    value: 'Mumbai',
    icon: <PolygonLogo />,
  },
  {
    key: '0xa86a',
    value: 'Avalanche',
    icon: <AvaxLogo />,
  },*/
  {
    key: '0xa869',
    // value: 'Fuji Testnet',
    value: 'Fuji',
    icon: <AvaxLogo />,
  },
];

function Chains() {
  const { switchNetwork } = useChain();
  const { chainId } = useMoralisDapp();

  const selected = menuItems.find((item) => item.key === chainId)?.key || menuItems[0].key;

  const handleClick = (event) => {
    switchNetwork(event.target.value);
  };

  return (
    <div>
      <FormControl fullWidth>
        <Select
          style={{ height: '3em' }}
          displayEmpty
          variant='standard'
          disableUnderline
          value={selected}
          onChange={handleClick}
        >
          {menuItems.map((item) => (
            <MenuItem value={item.key} key={item.key} icon={item.icon} style={styles.item}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                {item.icon}
                <span style={{ marginLeft: '5px' }}>{item.value}</span>
              </div>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
}

export default Chains;
