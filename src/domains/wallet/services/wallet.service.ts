import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  WebhookTransaction,
  WebhookWalletUpdates,
} from '../dtos/webhook-wallet-updates.dto';
import {
  EVM_CHAIN_CODE_NAME_MAP,
  SUPPORTED_EVM_CHAINS_FOR_AIRDROP,
} from '../constants/evm.constants';
import { PrivateKeyCredentials } from './../../../integrations/evms/types/evm.crendentions.type';
import { EVMClient } from './../../../integrations/evms/clients/evm-client.interface';
import { Web3HttpClient } from './../../../integrations/evms/clients/web3.client';
import { EVMAirdropConfiguration } from '../types/evm-airdrop.config';
import walletConfig from '../config/wallet.config';
import { ConfigType } from '@nestjs/config';
import airdropConfig from '../config/airdrop.config';
import { WalletServiceInterface } from './wallet.service.interface';
import {
  EVMChainAirdropSettingsNotConfigured,
  EVMChainUrlNotConfigured,
} from '../expections/wallet.exceptions';
import { TransactionReceiptDto } from './../../../integrations/evms/clients/dtos/transaction-receipt.type';
import { inspect } from 'util';
import { AIRDROP_TRANSACTION_REPOSITORY_TOKEN } from '../constants/wallet.constants';
import { AirdropTransactionRepositoryInterface } from '../repositories/airdrop-transaction.repository.interface';
import { AirdropTransactionEntityFactory } from '../factories/airdrop-transaction-entity.factory';
import { AirdropTransactionEntity } from '../entities/airdrop-transaction.entity';

@Injectable()
export class WalletService implements WalletServiceInterface {
  private readonly logger = new Logger('WalletService');
  constructor(
    @Inject(walletConfig.KEY)
    private readonly walletConfiguration: ConfigType<typeof walletConfig>,
    @Inject(airdropConfig.KEY)
    private readonly airdropConfiguration: ConfigType<typeof airdropConfig>,
    @Inject(AIRDROP_TRANSACTION_REPOSITORY_TOKEN)
    private readonly airdropTransactionRepository: AirdropTransactionRepositoryInterface,
  ) {}

  async handleWalletNotifications(walletUpdates: WebhookWalletUpdates) {
    // find eligible wallets and airdrop funds.
    if (
      SUPPORTED_EVM_CHAINS_FOR_AIRDROP.includes(
        EVM_CHAIN_CODE_NAME_MAP[walletUpdates.chainId],
      )
    ) {
      await this.processNotificationForAirdropFunds(walletUpdates);
    }

    //..implement other functionalities if same webhook is used for multiple use cases
  }

  async getAirdropTransactions(): Promise<AirdropTransactionEntity[]> {
    return this.airdropTransactionRepository.find();
  }

  async processNotificationForAirdropFunds(
    walletUpdates: WebhookWalletUpdates,
  ) {
    const { chainId, confirmed } = walletUpdates;
    const chainName = EVM_CHAIN_CODE_NAME_MAP[chainId];

    const chainUrl = this.walletConfiguration.evmChainUrlMap[chainName];
    if (!chainUrl) {
      throw new EVMChainUrlNotConfigured();
    }

    const airdropConfig = this.airdropConfiguration[chainName];
    // Webhook will send two events for a single trasaction, it is used to avoid double transactions.
    if (!confirmed) {
      this.logger.log(
        `Airdrop config for ${chainName} with url ${chainUrl}: ${JSON.stringify(airdropConfig)}`,
      );
      await this.airdropTokenForEligibleWallets(
        walletUpdates.txs,
        new Web3HttpClient(chainUrl),
        airdropConfig,
      );
    }
  }

  async airdropTokenForEligibleWallets(
    transactions: WebhookTransaction[],
    client: EVMClient,
    airdropConfig: EVMAirdropConfiguration,
  ) {
    if (!airdropConfig) {
      throw new EVMChainAirdropSettingsNotConfigured();
    }

    const walletsWithLowBalance =
      await this.getWalletsWithLowBalanceByTransactions(
        transactions,
        client,
        airdropConfig,
      );

    const fromAccountCredentials = new PrivateKeyCredentials(
      this.walletConfiguration.defaultWalletPrivatekey,
    );
    const fromAccountAddress = await this.getDefaultAccountAddress(
      client,
      fromAccountCredentials.privateKey,
    );

    for (const walletAddress of walletsWithLowBalance) {
      this.logger.log(
        `Wallet ${walletAddress} below threshold. Airdropping from ${fromAccountAddress}`,
      );

      await this.creditWallet(
        fromAccountAddress,
        walletAddress,
        client,
        fromAccountCredentials,
        airdropConfig,
      );
    }
  }

  async getDefaultAccountAddress(
    client: EVMClient,
    privateKey: string,
  ): Promise<string> {
    const account = await client.getAccountByPrivateKey(privateKey);
    return account.address;
  }

  async getWalletsWithLowBalanceByTransactions(
    transactions: WebhookTransaction[],
    client: EVMClient,
    airdropConfig: EVMAirdropConfiguration,
  ): Promise<string[]> {
    const walletsWithLowBalance = [];

    for (const transaction of transactions) {
      const accountBalance = await client.getBalance(
        transaction.fromAddress,
        'ether',
      );
      this.logger.debug(
        `Balance for account with address ${transaction.fromAddress}: ${accountBalance}`,
      );
      if (parseFloat(accountBalance) < airdropConfig.threshold) {
        walletsWithLowBalance.push(transaction.fromAddress);
      }
    }

    return walletsWithLowBalance;
  }

  async creditWallet(
    fromAccountAddress: string,
    toAccountAddress: string,
    client: EVMClient,
    fromAccountCredentials: PrivateKeyCredentials,
    airdropConfig: EVMAirdropConfiguration,
  ): Promise<TransactionReceiptDto & { error?: string }> {
    const transactionToBeExecuted = {
      to: toAccountAddress,
      from: fromAccountAddress,
      value: client.convertAmountToWeiUnits(
        airdropConfig.airdropAmount.toString(),
        airdropConfig.units as any,
      ),
      gas: 21000,
      gasPrice: client.convertAmountToWeiUnits('50', 'gwei'),
    };

    try {
      const airdropTransaction = await client.sendTransaction(
        transactionToBeExecuted,
        fromAccountCredentials,
      );

      const airdropTransactionEntity =
        AirdropTransactionEntityFactory.createEntityFromAirdropTransactionReceipt(
          airdropTransaction,
          airdropConfig.airdropAmount.toString(),
          null,
        );
      await this.airdropTransactionRepository.create(airdropTransactionEntity);

      return airdropTransaction;
    } catch (e) {
      this.logger.error(
        `Error while performing transaction ${JSON.stringify(transactionToBeExecuted)}: ${inspect(e)}`,
      );
      const errorAirdropTransaction = new TransactionReceiptDto(
        '',
        transactionToBeExecuted.from,
        transactionToBeExecuted.to,
        transactionToBeExecuted.gas.toString(),
        transactionToBeExecuted.gasPrice,
      );
      const airdropTransactionEntity =
        AirdropTransactionEntityFactory.createEntityFromAirdropTransactionReceipt(
          errorAirdropTransaction,
          airdropConfig.airdropAmount.toString(),
          e,
        );
      await this.airdropTransactionRepository.create(airdropTransactionEntity);

      throw e;
    }
  }
}
