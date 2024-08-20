import { AirdropTransactionRepositoryInterface } from "./../../../src/domains/wallet/repositories/airdrop-transaction.repository.interface";

export const AirdropTransactionRepositoryMock = (): jest.Mocked<AirdropTransactionRepositoryInterface> => {
    return {
      find: jest.fn(),
      create: jest.fn(),
    };
  };