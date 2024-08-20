import { Test, TestingModule } from '@nestjs/testing';
import { IntegrationsModule } from './../../../integrations/integrations.module';
import { ConfigModule } from '@nestjs/config';
import walletConfig from '../config/wallet.config';
import airdropConfig from '../config/airdrop.config';
import {
  AIRDROP_TRANSACTION_REPOSITORY_TOKEN,
  WALLET_SERVICE_TOKEN,
} from '../constants/wallet.constants';
import { WalletServiceMock } from './../../../../test/mocks/services/wallet.service.mock';
import { WalletServiceInterface } from './../services/wallet.service.interface';
import * as request from 'supertest';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { AirdropTransactionRepositoryMock } from './../../../../test/mocks/repositories/airdrop-transaction.repository';
import { AirdropTransactionEntityMock } from './../../../../test/mocks/entities/airdrop-transaction.entity.mock';
import { GetAirdropTransactionsResponse } from '../dtos/get-airdrop-transactions.response.dto';
import { AirdropTransactionsController } from './airdrop-transactions.controller';

describe('AirdropTransactionsController', () => {
  let airdropTransactionsController: AirdropTransactionsController;
  let walletService: jest.Mocked<WalletServiceInterface>;
  let app: INestApplication;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        IntegrationsModule,
        ConfigModule.forFeature(walletConfig),
        ConfigModule.forFeature(airdropConfig),
      ],
      controllers: [AirdropTransactionsController],
      providers: [
        {
          provide: WALLET_SERVICE_TOKEN,
          useValue: WalletServiceMock(),
        },
        {
          provide: AIRDROP_TRANSACTION_REPOSITORY_TOKEN,
          useValue: AirdropTransactionRepositoryMock(),
        },
      ],
    }).compile();

    airdropTransactionsController = module.get<AirdropTransactionsController>(
      AirdropTransactionsController,
    );
    walletService =
      module.get<jest.Mocked<WalletServiceInterface>>(WALLET_SERVICE_TOKEN);
    app = module.createNestApplication();
    await app.init();
  });

  it('should be defined', () => {
    expect(airdropTransactionsController).toBeDefined();
  });

  describe('GET /airdrop-transactions', () => {
    it('should 200 when valid request is passed', () => {
      walletService.getAirdropTransactions.mockResolvedValueOnce([]);

      return request(app.getHttpServer())
        .get('/airdrop-transactions')
        .expect(HttpStatus.OK);
    });

    it('should 200 and empty transactions array', () => {
      walletService.getAirdropTransactions.mockResolvedValueOnce([]);
      return request(app.getHttpServer())
        .get('/airdrop-transactions')
        .expect((res: Response) => {
          expect(res.status).toEqual(HttpStatus.OK);
          expect(res.body).toEqual([]);
        });
    });

    it('should 200 and transactions array', () => {
      const airdropTransactionEntity = AirdropTransactionEntityMock.generate(
        '0.003',
        null,
      );
      walletService.getAirdropTransactions.mockResolvedValueOnce([
        airdropTransactionEntity,
      ]);

      return request(app.getHttpServer())
        .get('/airdrop-transactions')
        .expect((res: Response) => {
          expect(res.status).toEqual(HttpStatus.OK);
          expect(res.body).toEqual([
            new GetAirdropTransactionsResponse(
              airdropTransactionEntity.fromAddress,
              airdropTransactionEntity.toAddress,
              airdropTransactionEntity.amount,
              airdropTransactionEntity.transactionHash,
              airdropTransactionEntity.error,
            ),
          ]);
        });
    });
  });
});
