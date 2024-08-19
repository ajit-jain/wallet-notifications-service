import { Inject, Injectable } from '@nestjs/common';
import { WebhookTransaction, WebhookWalletUpdates } from '../dtos/webhook-wallet-updates.dto';
import { EVM_CHAIN_CODE_NAME_MAP, SUPPORTED_EVM_CHAINS_FOR_AIRDROP } from '../constants/evm.constants';
import { PrivateKeyCredentials } from './../../../integrations/evms/types/evm.crendentions.type';
import Web3 from 'web3';
import { EVMClient } from './../../../integrations/evms/clients/evm-client.interface';
import { Web3HttpClient } from './../../../integrations/evms/clients/web3.client';
import { EVMAirdropConfiguration } from '../types/evm-airdrop.config';
import walletConfig from '../config/wallet.config';
import { ConfigType } from '@nestjs/config';
import airdropConfig from '../config/airdrop.config';
import { WalletServiceInterface } from './wallet.service.interface';
import { EVMChainAirdropSettingsNotConfigured, EVMChainUrlNotConfigured } from '../expections/wallet.exceptions';
import { TransactionReceiptDto } from 'src/integrations/evms/clients/dtos/transaction-receipt.type';
@Injectable()
export class WalletService implements WalletServiceInterface {
    constructor(
        @Inject(walletConfig.KEY)
        private readonly walletConfiguration: ConfigType<typeof walletConfig>,
        @Inject(airdropConfig.KEY)
        private readonly airdropConfiguration: ConfigType<typeof airdropConfig>,
      ) {}
    
    async handleWalletNotifications(walletUpdates: WebhookWalletUpdates) {
        // find eligible wallets and airdrop funds.
        if(SUPPORTED_EVM_CHAINS_FOR_AIRDROP.includes(EVM_CHAIN_CODE_NAME_MAP[walletUpdates.chainId])) {
            await this.fundEligibleWalletByAirdrop(walletUpdates);
        }

        //..implement other functionalities if same webhook is used for multiple use cases
    }

    async fundEligibleWalletByAirdrop(walletUpdates: WebhookWalletUpdates) {
        const { chainId, confirmed } = walletUpdates;
        const chainName = EVM_CHAIN_CODE_NAME_MAP[chainId];
        console.log("Chain Name:", chainName);

        const chainUrl = this.walletConfiguration.evmChainUrlMap[chainName];
        if(!chainUrl) {
            throw new EVMChainUrlNotConfigured()
        }
        console.log("Chain URL:",chainUrl);

        const airdropConfig = this.airdropConfiguration[chainName];

        // Webhook will send two events for a single trasaction, it is used to avoid double transactions.
        if (!confirmed) {
            await this.updateWalletIfBalanceIsLow(walletUpdates.txs, new Web3HttpClient(chainUrl), airdropConfig);
        }
    }

    async updateWalletIfBalanceIsLow(transactions: WebhookTransaction[], client: EVMClient, airdropConfig: EVMAirdropConfiguration) {
        if(!airdropConfig) {
            throw new EVMChainAirdropSettingsNotConfigured()
        }

        const walletsWithLowBalance = await this.getWalletsWithLowBalanceByTransactions(transactions, client, airdropConfig);

        const fromAccountCredentials = new PrivateKeyCredentials(this.walletConfiguration.defaultWalletPrivatekey);
        const fromAccountAddress = await this.getDefaultAccountAddress(client, fromAccountCredentials.privateKey);

        for(let walletAddress of walletsWithLowBalance) {
            console.log(`Wallet ${walletAddress} below threshold. Airdropping.`);
            await this.sendAirdrop(fromAccountAddress,walletAddress,client,fromAccountCredentials, airdropConfig);
        }
    }

    async getDefaultAccountAddress(client: EVMClient, privateKey: string): Promise<string> {
        const account = await client.getAccountByPrivateKey(privateKey);
        return account.address;
    }

    async getWalletsWithLowBalanceByTransactions(transactions: WebhookTransaction[], client: EVMClient, airdropConfig: EVMAirdropConfiguration): Promise<string[]>{
        const walletsWithLowBalance = [];

        for (const transaction of transactions) {
            const balance = await client.getBalance(transaction.fromAddress, 'ether');
    
            console.log("Balance and config: ",airdropConfig, balance);
            if (parseFloat(balance) < airdropConfig.threshold) {
                walletsWithLowBalance.push(transaction.fromAddress);
            }
        }
        
        return walletsWithLowBalance;
    }
    
    async sendAirdrop(fromAccountAddress:string,toAccountAddress:string, client: EVMClient, fromAccountCredentials: PrivateKeyCredentials, airdropConfig: EVMAirdropConfiguration): Promise<TransactionReceiptDto>{
        return await client.sendTransaction({
            to: toAccountAddress,
            from: fromAccountAddress,
            value: Web3.utils.toWei(airdropConfig.airdropAmount, airdropConfig.units as any),
            gas: 21000,
            gasPrice: Web3.utils.toWei("50", "gwei"),
        }, fromAccountCredentials)
    }

}
