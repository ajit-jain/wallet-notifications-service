import { Module } from '@nestjs/common';
import { WebhooksController } from './controllers/webhooks.controller';
import { IntegrationsModule } from './../../integrations/integrations.module';
import { WalletService } from './services/wallet.service';
import walletConfig from './config/wallet.config';
import { ConfigModule } from '@nestjs/config';
import airdropConfig from './config/airdrop.config';
import {
  AIRDROP_TRANSACTION_REPOSITORY_TOKEN,
  WALLET_SERVICE_TOKEN,
} from './constants/wallet.constants';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AirdropTransactionEntity } from './entities/airdrop-transaction.entity';
import { AirdropTransactionRepository } from './repositories/airdrop-transaction.repository';
import { AirdropTransactionsController } from './controllers/airdrop-transactions.controller';

@Module({
  imports: [
    IntegrationsModule,
    ConfigModule.forFeature(walletConfig),
    ConfigModule.forFeature(airdropConfig),
    TypeOrmModule.forFeature([AirdropTransactionEntity]),
  ],
  controllers: [WebhooksController, AirdropTransactionsController],
  providers: [
    {
      provide: WALLET_SERVICE_TOKEN,
      useClass: WalletService,
    },
    {
      provide: AIRDROP_TRANSACTION_REPOSITORY_TOKEN,
      useClass: AirdropTransactionRepository,
    },
  ],
})
export class WalletModule {}
