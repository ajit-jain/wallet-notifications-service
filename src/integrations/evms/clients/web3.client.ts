import Web3 from "web3";
import { EVMClient } from "./evm-client.interface";
import { AccountInfoDto } from "./dtos/account-info.type";
import { EVMTransaction } from "../types/evm.transaction.type";
import { PrivateKeyCredentials } from "../types/evm.crendentions.type";
import { TransactionReceiptDto } from "./dtos/transaction-receipt.type";
import { Logger } from "@nestjs/common";


export class Web3HttpClient implements EVMClient {
    private readonly logger = new Logger('WebHttpClient');
    private readonly client: Web3;
    constructor(rpcUrl: string) {
        this.client = new Web3(new Web3.providers.HttpProvider(rpcUrl));
    }

    async getBalance(userAddress: string, units: string): Promise<string> {
        const balance = await this.client.eth.getBalance(userAddress);
        return this.client.utils.fromWei(balance, 'ether');
    }

    async getAccountByPrivateKey(privateKey: string): Promise<AccountInfoDto> {
        const account = await this.client.eth.accounts.privateKeyToAccount(privateKey);
        return new AccountInfoDto(account.address);
    }
    
    async sendTransaction(transaction: EVMTransaction, credentials: PrivateKeyCredentials): Promise<TransactionReceiptDto> {
        const signedTx = await this.client.eth.accounts.signTransaction(transaction, credentials.privateKey);
        const receipt = await this.client.eth.sendSignedTransaction(signedTx.rawTransaction);
        this.logger.log(`Airdrop of value ${transaction.value} is sent to ${transaction.to} from ${transaction.from}. \nReceipt: ${receipt.transactionHash}`);
        return new TransactionReceiptDto(receipt.transactionHash.toString(),receipt.from,receipt.to,receipt.cumulativeGasUsed.toString(),receipt.effectiveGasPrice.toString() ?? transaction.gasPrice,transaction.value);
    }
}