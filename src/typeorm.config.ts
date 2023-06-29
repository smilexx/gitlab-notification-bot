import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

config();

export default new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: 5432,
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  ssl: false,
  synchronize: false,
  // entities: [Chat, Branch, MergeRequest, Approve, User, Project],
  namingStrategy: new SnakeNamingStrategy(),
  migrations: ['./migrations/*.ts'],
  entities: ['./src/entities/**/*.ts'],
});
