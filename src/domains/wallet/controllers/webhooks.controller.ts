import { Controller, Post, Req, Inject, HttpCode } from '@nestjs/common';
import { Request } from 'express';
import { WalletService } from '../services/wallet.service';
import { WALLET_SERVICE_TOKEN } from '../constants/wallet.constants';
import { WalletServiceInterface } from '../services/wallet.service.interface';

@Controller('webhooks')
export class WebhooksController {
    constructor(@Inject(WALLET_SERVICE_TOKEN) private walletService: WalletServiceInterface){}
    @Post('/wallet-notifications')
    @HttpCode(200)
    async handleWalletNotifications(@Req() request: Request) {
        await this.walletService.handleWalletNotifications(request.body);
        return { data: 'webhook processed successfully.'}
    }
}
