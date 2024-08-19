import { WebhookWalletUpdates } from "../dtos/webhook-wallet-updates.dto";

export interface WalletServiceInterface {
    handleWalletNotifications(walletUpdates: WebhookWalletUpdates): Promise<void>;
}