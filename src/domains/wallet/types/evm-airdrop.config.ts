import { EVM_CHAINS } from '../constants/evm.constants';

export interface EVMAirdropConfiguration {
  chainId: string;
  threshold: number;
  units: string;
  airdropAmount: number;
}

export type EVMAirdropConfigurationMap = Record<
  EVM_CHAINS,
  EVMAirdropConfiguration
>;
