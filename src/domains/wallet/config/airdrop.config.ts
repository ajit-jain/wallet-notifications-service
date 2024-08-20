import { registerAs } from '@nestjs/config';
import {
  EVM_CHAIN_NAME_CODE_MAP,
  EVM_CHAINS,
} from '../constants/evm.constants';

export default registerAs('airdrop', () => ({
  [EVM_CHAINS.BASE_MAINNET]: {
    chainId: EVM_CHAIN_NAME_CODE_MAP[EVM_CHAINS.BASE_MAINNET],
    threshold: 0.001,
    units: 'ether',
    airdropAmount: 0.0003,
  },
}));
