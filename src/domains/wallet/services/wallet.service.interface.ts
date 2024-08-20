import { WebhookWalletUpdates } from '../dtos/webhook-wallet-updates.dto';
import { AirdropTransactionEntity } from '../entities/airdrop-transaction.entity';

export interface WalletServiceInterface {
  handleWalletNotifications(walletUpdates: WebhookWalletUpdates): Promise<void>;
  getAirdropTransactions(): Promise<AirdropTransactionEntity[]>;
}
