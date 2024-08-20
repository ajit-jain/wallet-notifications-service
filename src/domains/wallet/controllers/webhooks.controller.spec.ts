import { Test, TestingModule } from '@nestjs/testing';
import { WebhooksController } from './webhooks.controller';
import { IntegrationsModule } from './../../../integrations/integrations.module';
import { ConfigModule } from '@nestjs/config';
import walletConfig from '../config/wallet.config';
import airdropConfig from '../config/airdrop.config';
import { AIRDROP_TRANSACTION_REPOSITORY_TOKEN, WALLET_SERVICE_TOKEN } from '../constants/wallet.constants';
import { WalletServiceMock } from './../../../../test/mocks/services/wallet.service.mock';
import { WalletServiceInterface } from '../services/wallet.service.interface';
import * as request from 'supertest';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { AirdropTransactionRepositoryMock } from './../../../../test/mocks/repositories/airdrop-transaction.repository';

describe('WebhooksController', () => {
  let webhooksController: WebhooksController;
  let walletService: jest.Mocked<WalletServiceInterface>;
  let app: INestApplication;
  const requestBody =  {
    "confirmed": false,
    "chainId": "0x2105",
    txs: [{ fromAddress: "Oxrandom-address" }]
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports:[IntegrationsModule,
        ConfigModule.forFeature(walletConfig),
        ConfigModule.forFeature(airdropConfig)],
      controllers: [WebhooksController],
      providers: [
        {
          provide: WALLET_SERVICE_TOKEN,
          useValue: WalletServiceMock()
        },
        {
          provide: AIRDROP_TRANSACTION_REPOSITORY_TOKEN,
          useValue: AirdropTransactionRepositoryMock()
        }
      ]
    }).compile();

    webhooksController = module.get<WebhooksController>(WebhooksController);
    walletService = module.get<jest.Mocked<WalletServiceInterface>>(WALLET_SERVICE_TOKEN);
    app = module.createNestApplication();
    await app.init();
  });

  it('should be defined', () => {
    expect(webhooksController).toBeDefined();
  });

  describe('handleWalletNotifications', ()=>{
    it('should call handleWalletNotifications on the wallet service and return success message', async () => {
      const mockRequest = {
        body: requestBody,
      };
  
      const result = await webhooksController.handleWalletNotifications(mockRequest as any);
  
      expect(walletService.handleWalletNotifications).toHaveBeenCalledWith(mockRequest.body);
      expect(result).toEqual({ data: 'webhook processed successfully.' });
    });
  })

  describe('POST /wallet-notifications', ()=> {
    it('should 200 when valid request is passed', () => {
      
      return request(app.getHttpServer())
        .post('/webhooks/wallet-notifications')
        .expect(HttpStatus.OK);
    });

    it('should 200 when valid body is passed', () => {
      
      return request(app.getHttpServer())
        .post('/webhooks/wallet-notifications')
        .send(requestBody)
        .expect((res: Response) => {
          expect(res.status).toEqual(HttpStatus.OK);
          expect(res.body).toEqual({ data: 'webhook processed successfully.' });
        });
    });

    it('should 400 when handle wallet notifications throws an error', () => {
      const error = new Error('Something went wrong');
      walletService.handleWalletNotifications.mockRejectedValue(error);
      return request(app.getHttpServer())
        .post('/webhooks/wallet-notifications')
        .send(requestBody)
        .expect((res: Response) => {
          expect(res.status).toEqual(HttpStatus.INTERNAL_SERVER_ERROR);
        });
    });
  })
});
