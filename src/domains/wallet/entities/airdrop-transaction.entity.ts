import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'airdrop_transactions' })
export class AirdropTransactionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  fromAddress: string;

  @Column({ type: 'text' })
  toAddress: string;

  @Column({ type: 'text' })
  gasUsed: string;

  @Column({ type: 'text' })
  gasPriceUsed: string;

  @Column({ type: 'text' })
  amount: string;

  @Column({ type: 'text', nullable: true })
  transactionHash: string;

  @Column({ type: 'jsonb', nullable: true })
  error: string;
}
