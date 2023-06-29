import { DataSource } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { config } from 'dotenv';
import { Approve } from './entities/approve.entity';
import { Project } from './entities/project.entity';
import { Branch } from './entities/branch.entity';
import { Chat } from './entities/chat.entity';
import { MergeRequest } from './entities/merge-request.entity';
import { User } from './entities/user.entity';

config();

export default new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: 5432,
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  entities: [Chat, Branch, MergeRequest, Approve, User, Project],
  namingStrategy: new SnakeNamingStrategy(),
  migrations: ['./dist/migrations/*.js'],
});
