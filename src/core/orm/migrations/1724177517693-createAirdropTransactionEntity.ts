import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateAirdropTransactionEntity1724177517693 implements MigrationInterface {
    name = 'CreateAirdropTransactionEntity1724177517693'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "airdrop_transactions" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "from_address" text NOT NULL, "to_address" text NOT NULL, "gas_used" text NOT NULL, "gas_price_used" text NOT NULL, "amount" text NOT NULL, "transaction_hash" text, "error" jsonb, CONSTRAINT "PK_6b5ddc1ccafd9ed584989645a2d" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "airdrop_transactions"`);
    }

}
