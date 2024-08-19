import { Test, TestingModule } from '@nestjs/testing';
import { WalletService } from './wallet.service';
import { ConfigType } from '@nestjs/config';
import walletConfig from '../config/wallet.config';
import airdropConfig from '../config/airdrop.config';
import { EVM_CHAIN_NAME_CODE_MAP, EVM_CHAINS } from '../constants/evm.constants';
import { Web3HttpClient } from './../../../integrations/evms/clients/web3.client';
import { EVMClientMock } from './../../../../test/mocks/evmClients/evm.client';
import { EVMChainAirdropSettingsNotConfigured, EVMChainUrlNotConfigured } from '../expections/wallet.exceptions';
import e from 'express';
import { TransactionReceiptDto } from './../../../integrations/evms/clients/dtos/transaction-receipt.type';
import { PrivateKeyCredentials } from './../../../integrations/evms/types/evm.crendentions.type';

jest.mock('./../../../integrations/evms/clients/web3.client',() => {
  return {
      Web3HttpClient: jest.fn().mockImplementation(() => EVMClientMock()),
  };
}); 

describe('WalletService', () => {
  let walletService: WalletService;
  // Mock values for the config
  const mockWalletConfig: ConfigType<typeof walletConfig> = {
    defaultWalletPrivatekey: "TEST-KEY",
    evmChainUrlMap: {
      [EVM_CHAINS.BASE_MAINNET]: "http://test-base-url.com/",
      [EVM_CHAINS.ETHEREUM_MAINNET]:  "http://test-ethereum-url.com/",
      [EVM_CHAINS.POLYGON_MAINNET]:  "http://test-polygon-url.com/"
    }
  };

  const mockAirdropConfig: ConfigType<typeof airdropConfig> = {
    [EVM_CHAINS.BASE_MAINNET]: {
      chainId: EVM_CHAIN_NAME_CODE_MAP[EVM_CHAINS.BASE_MAINNET],
      threshold: 0.00001,
      units: 'ether',
      airdropAmount: 0.00003
    },
  };

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        WalletService,
        {
          provide: walletConfig.KEY,
          useValue: mockWalletConfig,
        },
        {
          provide: airdropConfig.KEY,
          useValue: mockAirdropConfig,
        },
      ],
    }).compile();

    walletService = moduleRef.get<WalletService>(WalletService);
  });

  it('should be defined', () => {
    expect(walletService).toBeDefined();
  });

  describe('handleWalletNotifications', ()=>{

    it('should not trigger updateWalletIfBalanceIsLow when passed chain id is supported for airdrop', async()=>{
      const walletUpdates = {
            chainId: '0000000000000',
            confirmed: false,
            txs: [],
          };
      const fundEligibleWalletByAirdropSpy = jest.spyOn(walletService, 'fundEligibleWalletByAirdrop').mockResolvedValueOnce(undefined);

      await walletService.handleWalletNotifications(walletUpdates);
      expect(fundEligibleWalletByAirdropSpy).toHaveBeenCalledTimes(0);
    })

    it('should trigger updateWalletIfBalanceIsLow when passed chain id is supported for airdrop', async()=>{
      const walletUpdates = {
            chainId: EVM_CHAIN_NAME_CODE_MAP[EVM_CHAINS.BASE_MAINNET],
            confirmed: false,
            txs: [],
          };
      const fundEligibleWalletByAirdropSpy = jest.spyOn(walletService, 'fundEligibleWalletByAirdrop').mockResolvedValueOnce(undefined);
      
      await walletService.handleWalletNotifications(walletUpdates);
      expect(fundEligibleWalletByAirdropSpy).toHaveBeenCalledTimes(1);
    })

  })

  describe('fundEligibleWalletByAirdrop', ()=>{

    it('should not trigger updateWalletIfBalanceIsLow if wallet update is confirmed', async () => {
      const walletUpdates = {
        chainId: EVM_CHAIN_NAME_CODE_MAP[EVM_CHAINS.BASE_MAINNET],
        confirmed: true,
        txs: [],
      };

      const updateWalletIfBalanceIsLowSpy = jest.spyOn(walletService, 'updateWalletIfBalanceIsLow').mockResolvedValueOnce(undefined);

      
      await walletService.fundEligibleWalletByAirdrop(walletUpdates);
      
      expect(updateWalletIfBalanceIsLowSpy).toHaveBeenCalledTimes(0);
    });

    it('should trigger updateWalletIfBalanceIsLow if wallet update is not confirmed', async () => {
      const walletUpdates = {
        chainId: EVM_CHAIN_NAME_CODE_MAP[EVM_CHAINS.BASE_MAINNET],
        confirmed: false,
        txs: [],
      };

      const updateWalletIfBalanceIsLowSpy = jest.spyOn(walletService, 'updateWalletIfBalanceIsLow').mockResolvedValueOnce(undefined);

      
      await walletService.fundEligibleWalletByAirdrop(walletUpdates);
      
      expect(updateWalletIfBalanceIsLowSpy).toHaveBeenCalledTimes(1);
    });

    it('should throw error when chain url not exists', async () => {
      const walletUpdates = {
        chainId: EVM_CHAIN_NAME_CODE_MAP['xyz'],
        confirmed: false,
        txs: [],
      };

      const updateWalletIfBalanceIsLowSpy = jest.spyOn(walletService, 'updateWalletIfBalanceIsLow').mockResolvedValueOnce(undefined);

      
      await expect(walletService.fundEligibleWalletByAirdrop(walletUpdates)).rejects.toThrow(new EVMChainUrlNotConfigured());
      
      expect(updateWalletIfBalanceIsLowSpy).toHaveBeenCalledTimes(0);
    });

    it('should throw error when updateWalletIfBalanceIsLow rejects', async () => {
      const walletUpdates = {
        chainId: EVM_CHAIN_NAME_CODE_MAP[EVM_CHAINS.BASE_MAINNET],
        confirmed: false,
        txs: [],
      };
      const error = new Error('Something went wrong');
      const updateWalletIfBalanceIsLowSpy = jest.spyOn(walletService, 'updateWalletIfBalanceIsLow').mockRejectedValueOnce(error);

      
      await expect(walletService.fundEligibleWalletByAirdrop(walletUpdates)).rejects.toThrow(error);
      
      expect(updateWalletIfBalanceIsLowSpy).toHaveBeenCalledTimes(1);
    });

  });

  describe('updateWalletIfBalanceIsLow',  ()=>{
    it('should throw an error when airdrop settings is not configured', async ()=> {
      await expect(walletService.updateWalletIfBalanceIsLow([], new Web3HttpClient('mockUrl'), undefined as any)).rejects.toThrow(new EVMChainAirdropSettingsNotConfigured());
    });

    it('should return undefined when there is no errors', async ()=> {
      const getWalletsWithLowBalanceByTransactionsSpy = jest.spyOn(walletService, 'getWalletsWithLowBalanceByTransactions').mockResolvedValueOnce([]);
      const getDefaultAccountAddressSpy = jest.spyOn(walletService, 'getDefaultAccountAddress').mockResolvedValueOnce('defaultAddress');
      const sendAirdrop = jest.spyOn(walletService,'sendAirdrop').mockResolvedValueOnce(undefined);
      const result = await walletService.updateWalletIfBalanceIsLow([], new Web3HttpClient('mockUrl'), mockAirdropConfig[EVM_CHAINS.BASE_MAINNET]);
      
      expect(result).toBeUndefined();
      expect(getDefaultAccountAddressSpy).toHaveBeenCalledTimes(1);
      expect(getWalletsWithLowBalanceByTransactionsSpy).toHaveBeenCalledTimes(1);
      expect(sendAirdrop).toHaveBeenCalledTimes(0);
    });

    it('should trigger sendAirdrop when there is no errors', async ()=> {
      const getWalletsWithLowBalanceByTransactionsSpy = jest.spyOn(walletService, 'getWalletsWithLowBalanceByTransactions').mockResolvedValueOnce(["testAddress"]);
      const getDefaultAccountAddressSpy = jest.spyOn(walletService, 'getDefaultAccountAddress').mockResolvedValueOnce('defaultAddress');
      const sendAirdrop = jest.spyOn(walletService,'sendAirdrop').mockResolvedValueOnce(undefined);
      const result = await walletService.updateWalletIfBalanceIsLow([], new Web3HttpClient('mockUrl'), mockAirdropConfig[EVM_CHAINS.BASE_MAINNET]);
      
      expect(result).toBeUndefined();
      expect(getDefaultAccountAddressSpy).toHaveBeenCalledTimes(1);
      expect(getWalletsWithLowBalanceByTransactionsSpy).toHaveBeenCalledTimes(1);
      expect(sendAirdrop).toHaveBeenCalledTimes(1);
    });
  });

  describe('getDefaultAccountAddress', ()=> {

    it('should return fetched address', async ()=>{

      const defaultAddress = 'defaultAddress';
      const client = new Web3HttpClient('mockUrl');
      jest.spyOn(client, 'getAccountByPrivateKey').mockResolvedValueOnce({address: defaultAddress});
      const result = await walletService.getDefaultAccountAddress(client, mockWalletConfig.defaultWalletPrivatekey);
      expect(result).toBe(defaultAddress);

    });

    it('should return error when not able to fetch address', async ()=>{

      const error = new Error('Something went wrong');
      const client = new Web3HttpClient('mockUrl');
      jest.spyOn(client, 'getAccountByPrivateKey').mockRejectedValueOnce(error);
      await expect(walletService.getDefaultAccountAddress(client, mockWalletConfig.defaultWalletPrivatekey)).rejects.toThrow(error);

    });

  });

  describe('getWalletsWithLowBalanceByTransactions', ()=> {

    it('return empty array when empty transactions are passed', async ()=> {
      const result = await walletService.getWalletsWithLowBalanceByTransactions([],new Web3HttpClient('mockUrl'),mockAirdropConfig[EVM_CHAINS.BASE_MAINNET]);
      expect(result).toEqual([]);
    });

    it('return empty array when no address have low balance', async ()=> {
      const testAddress = 'testAddress';
      const client = new Web3HttpClient('mockUrl');
      jest.spyOn(client, 'getBalance').mockResolvedValueOnce('1');
      const result = await walletService.getWalletsWithLowBalanceByTransactions([{fromAddress: testAddress}], client, mockAirdropConfig[EVM_CHAINS.BASE_MAINNET]);
      expect(result).toEqual([]);
    });

    it('return array when address have low balance', async ()=> {
      const testAddress = 'testAddress';
      const client = new Web3HttpClient('mockUrl');
      jest.spyOn(client, 'getBalance').mockResolvedValueOnce('0.000000000001');
      const result = await walletService.getWalletsWithLowBalanceByTransactions([{fromAddress: testAddress}], client, mockAirdropConfig[EVM_CHAINS.BASE_MAINNET]);
      expect(result).toEqual([testAddress]);
    });

  });

  describe('sendAirdrop', ()=>{

    it('return transaction on successful transaction', async ()=> {
      const transactionReceiptDto = new TransactionReceiptDto("0xhdhddhd");
      const client = new Web3HttpClient('mockUrl');
      jest.spyOn(client, 'sendTransaction').mockResolvedValueOnce(transactionReceiptDto);
      const result = await walletService.sendAirdrop('defaultAddress', 'testAddress', client, new PrivateKeyCredentials(mockWalletConfig.defaultWalletPrivatekey), mockAirdropConfig[EVM_CHAINS.BASE_MAINNET]);
      expect(result).toEqual(transactionReceiptDto);
    });

    it('return transaction on successful transaction', async ()=> {
      const error = new Error('Something went wrong');
      const transactionReceiptDto = new TransactionReceiptDto("0xhdhddhd");
      const client = new Web3HttpClient('mockUrl');
      jest.spyOn(client, 'sendTransaction').mockRejectedValueOnce(error);
      await expect(walletService.sendAirdrop('defaultAddress', 'testAddress', client, new PrivateKeyCredentials(mockWalletConfig.defaultWalletPrivatekey), mockAirdropConfig[EVM_CHAINS.BASE_MAINNET])).rejects.toThrow(error);
    });
  })


});
