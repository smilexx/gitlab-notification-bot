import Resources from '@gitbeaker/core';
import { Gitlab } from '@gitbeaker/rest';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GITLAB_HOST, GITLAB_TOKEN, MINIMAL_APPROVES } from '../../config';
import { Approve } from '../../entities/approve.entity';
import { MergeRequest } from '../../entities/merge-request.entity';
import { User } from '../../entities/user.entity';
import { UsersService } from '../users/users.service';

@Injectable()
export class MergeService {
  private api: Resources.Gitlab = null;

  constructor(
    @InjectRepository(MergeRequest)
    private mergeRequestsRepository: Repository<MergeRequest>,
    @InjectRepository(Approve)
    private approvesRepository: Repository<Approve>,
    private usersService: UsersService,
  ) {
    this.api = new Gitlab({
      token: GITLAB_TOKEN,
      host: GITLAB_HOST,
    });

    console.log(GITLAB_TOKEN);
  }

  public async createOne(
    data: Pick<
      MergeRequest,
      'url' | 'status' | 'mergeRequestId' | 'chat' | 'project' | 'user'
    >,
  ) {
    return this.mergeRequestsRepository.save(data);
  }

  public async updateOne(mergeRequest: MergeRequest) {
    return this.mergeRequestsRepository.save(mergeRequest);
  }

  public async findOneByUrl(url: string) {
    return this.mergeRequestsRepository.findOneBy({ url });
  }

  public async setReviewer(mergeRequest: MergeRequest): Promise<void> {
    const reviewer = await this.usersService.getReviwerForUser(
      mergeRequest.user,
    );

    if (reviewer && reviewer.externalId) {
      await this.api.MergeRequests.edit(
        mergeRequest.project.externalId,
        mergeRequest.mergeRequestId,
        {
          reviewerId: reviewer.externalId,
        },
      );
    }
  }

  public async createDiscussion(
    mergeRequest: MergeRequest,
  ): Promise<MergeRequest> {
    const count = await this.getCountApproves(mergeRequest);

    const result = await this.api.MergeRequestDiscussions.create(
      mergeRequest.project.externalId,
      mergeRequest.mergeRequestId,
      `[${count}/${MINIMAL_APPROVES}]`,
    );

    const [{ id }] = result.notes;

    mergeRequest.noteId = id;
    mergeRequest.discussionId = result.id;
    return this.mergeRequestsRepository.save(mergeRequest);
  }

  public async approve(mergeRequest: MergeRequest, user: User): Promise<void> {
    const approve = await this.approvesRepository.findOneBy({
      mergeRequest,
      user,
    });

    if (!approve) {
      await this.approvesRepository.save({ mergeRequest, user });
    }

    await this.check(mergeRequest);
  }

  public async unapprove(
    mergeRequest: MergeRequest,
    user: User,
  ): Promise<void> {
    if (user) {
      await this.approvesRepository.delete({ mergeRequest, user });
    }

    await this.check(mergeRequest);
  }

  public async unlock(mergeRequest: MergeRequest) {
    if (mergeRequest.discussionId) {
      await this.api.MergeRequestDiscussions.resolve(
        mergeRequest.project.externalId,
        mergeRequest.mergeRequestId,
        mergeRequest.discussionId,
        true,
      );
    }
  }

  public async lock(mergeRequest: MergeRequest): Promise<void> {
    if (mergeRequest.discussionId && mergeRequest.noteId) {
      await this.api.MergeRequestDiscussions.resolve(
        mergeRequest.project.externalId,
        mergeRequest.mergeRequestId,
        mergeRequest.discussionId,
        false,
      );
    } else {
      await this.createDiscussion(mergeRequest);
    }
  }

  public async getCountApproves(mergeRequest: MergeRequest): Promise<number> {
    return this.approvesRepository.countBy({ mergeRequest });
  }

  private async updateNote(mergeRequest: MergeRequest): Promise<number> {
    const count = await this.getCountApproves(mergeRequest);

    await this.api.MergeRequestDiscussions.editNote(
      mergeRequest.project.externalId,
      mergeRequest.mergeRequestId,
      mergeRequest.discussionId,
      mergeRequest.noteId,
      { body: `[${count}/${MINIMAL_APPROVES}]` },
    );

    return count;
  }

  private async check(mergeRequest: MergeRequest) {
    const count = await this.updateNote(mergeRequest);

    if (count >= MINIMAL_APPROVES) {
      await this.unlock(mergeRequest);
    } else {
      await this.lock(mergeRequest);
    }
  }
}
