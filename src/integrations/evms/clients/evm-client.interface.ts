import { EVMCredentails } from "../types/evm.crendentions.type";
import { EVMTransaction } from "../types/evm.transaction.type";
import { AccountInfoDto } from "./dtos/account-info.type";
import { TransactionReceiptDto } from "./dtos/transaction-receipt.type";

export interface EVMClient {
    getBalance(userAddress: string, units: string): Promise<string>;
    getAccountByPrivateKey(privateKey: string): Promise<AccountInfoDto>;
    sendTransaction(transaction: EVMTransaction, credentials: EVMCredentails): Promise<TransactionReceiptDto>;
}