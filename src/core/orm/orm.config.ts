import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import { DataSource } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { join } from 'path';
import { config as envConfig } from 'dotenv';
envConfig();

export const config = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  entities: [join(__dirname, '../../**', 'entities/**', '*.entity.{ts,js}')],
  migrations: [join(__dirname, 'migrations', '*.{ts,js}')],
  synchronize: false,
  uuidExtension: 'pgcrypto',
  namingStrategy: new SnakeNamingStrategy(),
  autoLoadEntities: true,
  logging: 'all',
  cli: {
    migrationsDir: 'src/core/orm/migrations/*.ts',
  },
} as PostgresConnectionOptions;

export default new DataSource(config);