import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Approve } from '../../entities/approve.entity';
import { User } from '../../entities/user.entity';
import { MergeRequest } from '../../entities/merge-request.entity';
import { MergeService } from './merge.service';

@Module({
  providers: [MergeService],
  exports: [MergeService],
  imports: [TypeOrmModule.forFeature([MergeRequest, Approve, User])],
})
export class MergeModule {}
