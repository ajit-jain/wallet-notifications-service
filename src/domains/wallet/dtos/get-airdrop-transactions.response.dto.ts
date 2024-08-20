export class GetAirdropTransactionsResponse {
  readonly fromAddress: string;
  readonly toAddress: string;
  readonly amount: string;
  readonly transactionHash: string;
  readonly error?: string;

  constructor(
    fromAddress: string,
    toAddress: string,
    amount: string,
    transactionHash: string,
    error?: string,
  ) {
    this.amount = amount;
    this.fromAddress = fromAddress;
    this.toAddress = toAddress;
    this.transactionHash = transactionHash;
    this.error = error;
  }
}
