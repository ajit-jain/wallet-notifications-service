import { Numbers } from 'web3';

export interface EVMTransaction {
  from: string;
  to: string;
  value: string;
  gas: Numbers;
  gasPrice: string;
}
