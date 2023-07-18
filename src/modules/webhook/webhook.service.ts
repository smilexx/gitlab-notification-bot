import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type {
  MergeRequestEvent,
  PipelineEvent,
  TagPushEvent,
} from 'gitlab-event-types';
import * as pug from 'pug';
import { isNil } from 'ramda';
import { Repository } from 'typeorm';
import { MINIMAL_APPROVES } from '../../config';
import { Branch } from '../../entities/branch.entity';
import { Chat } from '../../entities/chat.entity';
import { NotifyType } from '../../enums/event';
import { isWorkInProgress } from '../../utils/merge';
import { isNotifyStatus } from '../../utils/pipeline';
import { MergeService } from '../merge/merge.service';
import { TelegramService } from '../telegram/telegram.service';
import { MergeRequest } from '../../entities/merge-request.entity';
import { UsersService } from '../users/users.service';
import { ProjectsService } from '../projects/projects.service';

const templateMap = {
  [NotifyType.TagPush]: pug.compileFile('views/notify/tag.pug'),
  [NotifyType.MergeRequest]: pug.compileFile('views/notify/mergeRequest.pug'),
  [NotifyType.Pipeline]: pug.compileFile('views/notify/pipeline.pug'),
};

type UpdateMessageOptions = {
  project: string;
  user: string;
  title: string;
  url: string;
  approves: number;
};

@Injectable()
export class WebHookService {
  private readonly logger = new Logger(WebHookService.name);

  constructor(
    private readonly telegramService: TelegramService,
    @InjectRepository(Chat)
    private chatsRepository: Repository<Chat>,
    @InjectRepository(Branch)
    private branchesRepository: Repository<Branch>,
    private readonly mergeService: MergeService,
    private readonly usersService: UsersService,
    private readonly projectsService: ProjectsService,
  ) {}

  public notify = async (
    hash: string,
    data: PipelineEvent | TagPushEvent | MergeRequestEvent,
  ) => {
    const chat = await this.chatsRepository.findOne({ where: { hash } });

    if (!chat) {
      throw new NotFoundException('not found chat');
    }

    switch (data?.object_kind) {
      case NotifyType.Pipeline: {
        await this.onPipeline(chat, data);
        break;
      }

      case NotifyType.TagPush: {
        await this.onTagPush(chat, data);
        break;
      }

      case NotifyType.MergeRequest: {
        await this.onMergeRequest(chat, data);
        break;
      }

      default:
        throw new BadRequestException('unknown type');
    }
  };

  private onPipeline = async (chat: Chat, body: PipelineEvent) => {
    const {
      project,
      user,
      commit,
      builds,
      object_attributes: data,
    } = body || {};

    const branches = await this.branchesRepository.find({
      where: { chatId: chat?.chatId },
    });

    if (
      branches.length > 0 &&
      !branches.find(({ branch }) => data?.ref.search(branch) > -1)
    ) {
      return null;
    }

    this.logger.debug(chat);

    if (chat && isNotifyStatus(data)) {
      const message = await this.telegramService.sendMessage(
        chat?.chatId,
        templateMap[NotifyType.Pipeline]({
          status: data.status,
          project: project.name,
          user: user.name,
          branch: data.ref,
          message: commit.message,
          builds,
          webUrl: project?.web_url,
          id: data.id,
        }),
      );

      this.logger.debug('send message', message);
    }
  };

  private onTagPush = async (chat: Chat, body: TagPushEvent) => {
    const { ref, project, total_commits_count } = body || {};

    const tag = ref.split('/').pop();

    if (chat && total_commits_count > 0) {
      await this.telegramService.sendMessage(
        chat?.chatId,
        templateMap[NotifyType.TagPush]({
          project: project.name,
          webUrl: project.web_url,
          tag,
        }),
      );
    }
  };

  private onMergeRequest = async (chat: Chat, body: MergeRequestEvent) => {
    const { object_attributes: data } = body || {};
    const user = await this.usersService.findOneOrCreate(body.user);
    const project = await this.projectsService.findOneOrCreate(body.project);

    if (isWorkInProgress(data)) {
      return;
    }

    let mergeRequest = await this.mergeService.findOneByUrl(data.url);

    if (isNil(mergeRequest)) {
      mergeRequest = await this.mergeService.createOne({
        url: data.url,
        status: data.state,
        mergeRequestId: data.iid,
        project,
        chat,
        user,
      });

      const message = await this.telegramService.sendMessage(
        chat?.chatId,
        templateMap[NotifyType.MergeRequest]({
          project: project?.pathWithNamespace,
          user: user?.name,
          title: data?.title,
          url: data.url,
          approves: 0,
          totalApproves: MINIMAL_APPROVES,
        }),
      );

      this.logger.debug('send message', message);
      this.logger.log('merge request', { mergeRequest, project, user });

      mergeRequest.messageId = message.message_id;

      await this.mergeService.updateOne(mergeRequest);

      if (mergeRequest.status === 'opened') {
        await this.mergeService.createDiscussion(mergeRequest);
        await this.mergeService.setDefaultReviewer(mergeRequest);
      }
    }

    if (data.action === 'approved') {
      await this.mergeService.approve(mergeRequest, user);
    } else if (data.action === 'unapproved') {
      await this.mergeService.unapprove(mergeRequest, user);
    }

    mergeRequest.status = data.state;

    await this.mergeService.updateOne(mergeRequest);

    await this.updateMessage(chat, mergeRequest, {
      project: project?.pathWithNamespace,
      user: user?.name,
      title: data?.title,
      url: data.url,
      approves: await this.mergeService.getCountApproves(mergeRequest),
    });
  };

  private updateMessage = async (
    chat: Chat,
    mergeRequest: MergeRequest,
    { project, user, title, url, approves }: UpdateMessageOptions,
  ) => {
    if (mergeRequest.messageId) {
      await this.telegramService.editMessage(
        chat?.chatId,
        mergeRequest.messageId,
        templateMap[NotifyType.MergeRequest]({
          project,
          user,
          title,
          url,
          approves,
          totalApproves: MINIMAL_APPROVES,
        }),
      );
    }
  };
}
