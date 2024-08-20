import { AirdropTransactionEntityFactory } from './../../../src/domains/wallet/factories/airdrop-transaction-entity.factory';
import { AirdropTransactionEntity } from './../../../src/domains/wallet/entities/airdrop-transaction.entity';
import { TransactionReceiptDto } from './../../../src/integrations/evms/clients/dtos/transaction-receipt.type';

export class AirdropTransactionEntityMock {
  static generate(amount: string, error?: string): AirdropTransactionEntity {
    return AirdropTransactionEntityFactory.createEntityFromAirdropTransactionReceipt(
      new TransactionReceiptDto(
        '0xtestHash',
        '0xfromAddress',
        '0xtoAddress',
        '2100',
        '500',
      ),
      amount,
      error,
    );
  }
}
