import Resources from '@gitbeaker/core';
import { Gitlab } from '@gitbeaker/rest';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GITLAB_HOST, GITLAB_TOKEN, MINIMAL_APPROVES } from '../../config';
import { Approve } from '../../entities/approve.entity';
import { MergeRequest } from '../../entities/merge-request.entity';
import { User } from '../../entities/user.entity';
import GitlabEvents from 'gitlab-event-types';

@Injectable()
export class MergeService {
  private api: Resources.Gitlab = null;

  constructor(
    @InjectRepository(MergeRequest)
    private mergeRequestsRepository: Repository<MergeRequest>,
    @InjectRepository(Approve)
    private approvesRepository: Repository<Approve>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
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
      'url' | 'status' | 'mergeRequestId' | 'chat' | 'projectId'
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

  public async createDiscussion(
    mergeRequest: MergeRequest,
  ): Promise<MergeRequest> {
    const count = await this.getCountApproves(mergeRequest);

    const result = await this.api.MergeRequestDiscussions.create(
      mergeRequest.projectId,
      mergeRequest.mergeRequestId,
      `[${count}/${MINIMAL_APPROVES}]`,
    );

    const [{ id }] = result.notes;

    mergeRequest.noteId = id;
    mergeRequest.discussionId = result.id;
    return this.mergeRequestsRepository.save(mergeRequest);
  }

  public async approve(
    mergeRequest: MergeRequest,
    approver: GitlabEvents.User,
  ): Promise<void> {
    // TODO в пакете нету поля email
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const { email, name } = approver;

    let user = await this.userRepository.findOneBy({ email });

    if (!user) {
      user = await this.userRepository.save({ email, name });
    }

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
    approver: GitlabEvents.User,
  ): Promise<void> {
    // TODO в пакете нету поля email
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const { email } = approver;
    const user = await this.userRepository.findOneBy({ email });

    if (user) {
      await this.approvesRepository.delete({ mergeRequest, user });
    }

    await this.check(mergeRequest);
  }

  public async unlock(mergeRequest: MergeRequest) {
    if (mergeRequest.discussionId) {
      await this.api.MergeRequestDiscussions.resolve(
        mergeRequest.projectId,
        mergeRequest.mergeRequestId,
        mergeRequest.discussionId,
        true,
      );
    }
  }

  public async lock(mergeRequest: MergeRequest): Promise<void> {
    if (mergeRequest.discussionId && mergeRequest.noteId) {
      await this.api.MergeRequestDiscussions.resolve(
        mergeRequest.projectId,
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
      mergeRequest.projectId,
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
