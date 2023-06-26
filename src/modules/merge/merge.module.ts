import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Approve } from '../../entities/approve.entity';
import { MergeRequest } from '../../entities/merge-request.entity';
import { MergeService } from './merge.service';
import { UsersModule } from '../users/users.module';

@Module({
  providers: [MergeService],
  exports: [MergeService],
  imports: [UsersModule, TypeOrmModule.forFeature([MergeRequest, Approve])],
})
export class MergeModule {}
