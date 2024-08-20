import { WalletServiceInterface } from './../../../src/domains/wallet/services/wallet.service.interface';

export const WalletServiceMock = (): jest.Mocked<WalletServiceInterface> => {
  return {
    handleWalletNotifications: jest.fn(),
    getAirdropTransactions: jest.fn(),
  };
};
