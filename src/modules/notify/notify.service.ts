import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { pipe, includes, prop, __ } from 'ramda';
import { TelegramService } from '../telegram/telegram.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Branch } from '../../entities/branch.entity';
import { Repository } from 'typeorm';
import { Chat } from '../../entities/chat.entity';

@Injectable()
export class NotifyService {
  private readonly logger = new Logger(NotifyService.name);

  constructor(
    private readonly telegramService: TelegramService,
    @InjectRepository(Chat)
    private chatsRepository: Repository<Chat>,
    @InjectRepository(Branch)
    private branchesRepository: Repository<Branch>,
  ) {}

  public notify = async (hash: string, data: any) => {
    const chat = await this.chatsRepository.findOne({ where: { hash } });

    if (!chat) {
      throw new NotFoundException('not found chat');
    }

    switch (data?.object_kind) {
      case 'pipeline': {
        await this.notifyPipeline(chat, data);
        break;
      }

      case 'tag_push': {
        await this.notifyTag(chat, data);
        break;
      }

      default:
        throw new BadRequestException('unknown type');
    }
  };

  private notifyPipeline = async (chat: Chat, body: Record<string, any>) => {
    const { project, user, commit, builds, object_attributes } = body || {};

    const branches = await this.branchesRepository.find({
      where: { chatId: chat?.chatId },
    });

    if (
      branches.length > 0 &&
      !branches.find(({ branch }) => object_attributes?.ref.search(branch) > -1)
    ) {
      return null;
    }

    this.logger.debug(chat);

    if (chat && this.isNotifyStatus(object_attributes)) {
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

      await this.telegramService.sendMessage(chat?.chatId, text.join('\n'));
    }
  };

  private notifyTag = async (chat: Chat, body) => {
    const { ref, project, total_commits_count } = body || {};

    const tag = ref.split('/').pop();

    if (chat && total_commits_count > 0) {
      await this.telegramService.sendMessage(
        chat?.chatId,
        `${project?.name}: <a href="${project?.web_url}/-/tags/${tag}">${tag}</a>`,
      );
    }
  };

  private isNotifyStatus = pipe(
    prop('status'),
    includes(__, ['success', 'failed']),
  );

  private getBuild = (
    { id, name, status, started_at, finished_at },
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
