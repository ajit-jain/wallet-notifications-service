import { Controller, Get, Inject } from '@nestjs/common';
import { WALLET_SERVICE_TOKEN } from '../constants/wallet.constants';
import { WalletServiceInterface } from '../services/wallet.service.interface';
import { GetAirdropTransactionsResponse } from '../dtos/get-airdrop-transactions.response.dto';

@Controller('airdrop-transactions')
export class AirdropTransactionsController {
  constructor(
    @Inject(WALLET_SERVICE_TOKEN) private walletService: WalletServiceInterface,
  ) {}
  @Get()
  async getAirdropTransactions(): Promise<GetAirdropTransactionsResponse[]> {
    const transactions = await this.walletService.getAirdropTransactions();
    return transactions.map(
      (t) =>
        new GetAirdropTransactionsResponse(
          t.fromAddress,
          t.toAddress,
          t.amount,
          t.transactionHash,
          t.error,
        ),
    );
  }
}
