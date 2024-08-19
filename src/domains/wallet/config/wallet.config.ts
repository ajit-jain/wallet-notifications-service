import { registerAs } from '@nestjs/config';
import { EVM_CHAINS } from '../constants/evm.constants';

export default registerAs('wallet', () => ({
  defaultWalletPrivatekey: process.env.DEFAULT_WALLET_PRIVATE_KEY,
  evmChainUrlMap: {
    [EVM_CHAINS.BASE_MAINNET]: process.env.BASE_MAINNET_HTTP_URL,
    [EVM_CHAINS.ETHEREUM_MAINNET]: process.env.ETHEREUM_MAINNET_HTTP_URL,
    [EVM_CHAINS.POLYGON_MAINNET]: process.env.POLYGON_MAINNET_HTTP_URL
  }
}));