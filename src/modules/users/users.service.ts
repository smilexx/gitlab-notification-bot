import { Injectable } from '@nestjs/common';
import { Not, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import type GitlabEvents from 'gitlab-event-types';
import { User } from '../../entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findOneOrCreate(user: GitlabEvents.User): Promise<User> {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const { email, name, username, id } = user;

    try {
      return await this.usersRepository.findOneByOrFail({
        email,
      });
    } catch (error: any) {
      return this.usersRepository.save({
        email,
        name,
        username,
        externalId: id,
      });
    }
  }

  async getReviwerForUser(user: User): Promise<User | null> {
    const reviewers = await this.usersRepository.findBy({
      id: Not(user.id),
    });

    if (reviewers.length > 0) {
      return reviewers[Math.floor(Math.random() * reviewers.length)];
    }

    return null;
  }
}
