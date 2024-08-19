export class TransactionReceiptDto {
    transactionHash: string;
    constructor(transactionHash: string){
        this.transactionHash = transactionHash;
    }
}