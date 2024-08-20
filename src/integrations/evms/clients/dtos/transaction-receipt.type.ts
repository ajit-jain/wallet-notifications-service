export class TransactionReceiptDto {
  readonly transactionHash: string;
  readonly fromAddress: string;
  readonly toAddress: string;
  readonly gasUsed: string;
  readonly gasPriceUsed: string;
  constructor(
    transactionHash: string,
    fromAddress: string,
    toAddress: string,
    gasUsed: string,
    gasPriceUsed: string,
  ) {
    this.transactionHash = transactionHash;
    this.fromAddress = fromAddress;
    this.toAddress = toAddress;
    this.gasPriceUsed = gasPriceUsed;
    this.gasUsed = gasUsed;
  }
}
