import { InjectRepository } from '@nestjs/typeorm';
import { AirdropTransactionEntity } from '../entities/airdrop-transaction.entity';
import { Repository } from 'typeorm';
import { AirdropTransactionRepositoryInterface } from './airdrop-transaction.repository.interface';

export class AirdropTransactionRepository
  implements AirdropTransactionRepositoryInterface
{
  constructor(
    @InjectRepository(AirdropTransactionEntity)
    private readonly baseRepository: Repository<AirdropTransactionEntity>,
  ) {}

  async create(
    airdropTransactionEntity: AirdropTransactionEntity,
  ): Promise<void> {
    await this.baseRepository.save(airdropTransactionEntity);
  }

  async find(): Promise<AirdropTransactionEntity[]> {
    return this.baseRepository.find();
  }
}
