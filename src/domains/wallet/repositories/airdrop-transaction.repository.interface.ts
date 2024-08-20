import { AirdropTransactionEntity } from "../entities/airdrop-transaction.entity";

export interface AirdropTransactionRepositoryInterface {
    create(airdropTransactionEntity: AirdropTransactionEntity): Promise<void>;
    find(): Promise<AirdropTransactionEntity[]>;
}