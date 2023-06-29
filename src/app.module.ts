import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerModule } from 'nestjs-pino';
import { AppController } from './app.controller';
import {
  DATABASE_HOST,
  DATABASE_NAME,
  DATABASE_PASSWORD,
  DATABASE_USER,
  LOG_LEVEL,
} from './config';
import { Approve } from './entities/approve.entity';
import { Branch } from './entities/branch.entity';
import { Chat } from './entities/chat.entity';
import { MergeRequest } from './entities/merge-request.entity';
import { User } from './entities/user.entity';
import { MergeModule } from './modules/merge/merge.module';
import { TelegramModule } from './modules/telegram/telegram.module';
import { TelegramService } from './modules/telegram/telegram.service';
import { WebHookModule } from './modules/webhook/webhook.module';
import { UsersModule } from './modules/users/users.module';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { Project } from './entities/project.entity';
import { ProjectsModule } from './modules/projects/projects.module';

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        level: LOG_LEVEL,
      },
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: DATABASE_HOST,
      username: DATABASE_USER,
      password: DATABASE_PASSWORD,
      database: DATABASE_NAME,
      entities: [Chat, Branch, MergeRequest, Approve, User, Project],
      ssl: false,
      synchronize: false,
      namingStrategy: new SnakeNamingStrategy(),
    }),
    TelegramModule,
    WebHookModule,
    MergeModule,
    UsersModule,
    ProjectsModule,
  ],
  controllers: [AppController],
})
export class AppModule {
  constructor(private readonly telegramService: TelegramService) {
    this.telegramService.startBot();
  }
}
