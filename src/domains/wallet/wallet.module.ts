import { Module } from '@nestjs/common';
import { WebhooksController } from './controllers/webhooks.controller';
import { IntegrationsModule } from './../../integrations/integrations.module';
import { WalletService } from './services/wallet.service';
import walletConfig from './config/wallet.config';
import { ConfigModule } from '@nestjs/config';
import airdropConfig from './config/airdrop.config';
import { WALLET_SERVICE_TOKEN } from './constants/wallet.constants';

@Module({
    imports: [IntegrationsModule, ConfigModule.forFeature(walletConfig),ConfigModule.forFeature(airdropConfig)],
    controllers: [WebhooksController],
    providers: [{
        provide: WALLET_SERVICE_TOKEN,
        useClass: WalletService,
    }]
})
export class WalletModule {}
