import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Build, PipelineEvent, TagPushEvent } from 'gitlab-event-types';
import { includes, pipe, prop, __ } from 'ramda';
import { TelegramService } from '../telegram/telegram.service';

@Injectable()
export class NotifyService {
  private readonly logger = new Logger(NotifyService.name);

  constructor(private readonly telegramService: TelegramService) {}

  public notify = async (
    chatId: string,
    branches: string[],
    data: PipelineEvent | TagPushEvent,
  ) => {
    if (!chatId) {
      throw new NotFoundException('not found chat');
    }

    switch (data?.object_kind) {
      case 'pipeline': {
        await this.notifyPipeline(chatId, branches, data);
        break;
      }

      case 'tag_push': {
        await this.notifyTag(chatId, data);
        break;
      }

      default:
        throw new BadRequestException('unknown type');
    }
  };

  private notifyPipeline = async (
    chatId: string,
    branches: string[],
    body: PipelineEvent,
  ) => {
    const { project, user, commit, builds, object_attributes } = body || {};

    if (
      branches.length > 0 &&
      !branches.find(
        (branch) => object_attributes?.ref.search(new RegExp(branch)) > -1,
      )
    ) {
      return null;
    }

    this.logger.debug(chatId);

    if (chatId && this.isNotifyStatus(object_attributes)) {
      const text = [
        this.getStatus(object_attributes.status),
        `📽: ${project?.name}`,
        `👨‍💻: ${user?.name}`,
        `🎋: ${object_attributes?.ref}`,
        `💿: ${commit?.message}`,
        '',
        // `⏲: ${getDuration(object_attributes?.created_at, object_attributes?.finished_at)}`,
        ...builds.map((build) => this.getBuild(build, project)),
        '',
        `${project?.web_url}/pipelines/${object_attributes?.id}`,
      ];

      await this.telegramService.sendMessage(chatId, text.join('\n'));
    }
  };

  private notifyTag = async (chatId: string, body: TagPushEvent) => {
    const { ref, project, total_commits_count } = body || {};

    const tag = ref.split('/').pop();

    if (chatId && total_commits_count > 0) {
      await this.telegramService.sendMessage(
        chatId,
        `${project?.name}: <a href="${project?.web_url}/-/tags/${tag}">${tag}</a>`,
      );
    }
  };

  private isNotifyStatus = pipe(
    prop('status'),
    includes(__, ['success', 'failed']),
  );

  private getBuild = (
    { id, name, status, started_at, finished_at }: Build,
    { web_url },
  ) =>
    `${this.getStatus(status)}: <a href="${web_url}/-/jobs/${id}">${name}</a>`;

  private getStatus = (status: string) => {
    switch (status) {
      case 'created':
        return '⏸';
      case 'canceled':
        return '⏹';
      case 'pending':
        return '🕙';
      case 'running':
        return '▶️';
      case 'success':
        return '✅';
      case 'failed':
        return '🛑';
      case 'manual':
        return '⏯';
      default:
        return status;
    }
  };
}
