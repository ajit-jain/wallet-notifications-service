import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { IntegrationsModule } from './integrations/integrations.module';
import { WalletModule } from './domains/wallet/wallet.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), IntegrationsModule, WalletModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
