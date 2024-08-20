export interface WebhookWalletUpdates {
  confirmed: boolean;
  chainId: string;
  txs: WebhookTransaction[];
}

export interface WebhookTransaction {
  fromAddress: string;
}
