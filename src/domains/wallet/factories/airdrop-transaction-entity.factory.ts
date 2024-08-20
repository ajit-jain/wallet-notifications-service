import { TransactionReceiptDto } from './../../../integrations/evms/clients/dtos/transaction-receipt.type';
import { AirdropTransactionEntity } from '../entities/airdrop-transaction.entity';
import { randomUUID } from 'crypto';
export class AirdropTransactionEntityFactory {
  static createEntityFromAirdropTransactionReceipt(
    transactionReceipt: TransactionReceiptDto,
    amount: string,
    error: string,
  ): AirdropTransactionEntity {
    const airdropEntity = new AirdropTransactionEntity();
    airdropEntity.id = randomUUID();
    airdropEntity.amount = amount;
    airdropEntity.fromAddress = transactionReceipt.fromAddress;
    airdropEntity.toAddress = transactionReceipt.toAddress;
    airdropEntity.gasUsed = transactionReceipt.gasUsed;
    airdropEntity.gasPriceUsed = transactionReceipt.gasPriceUsed;
    airdropEntity.error = error ?? null;
    return airdropEntity;
  }
}
