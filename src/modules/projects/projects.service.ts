import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type GitlabEvents from 'gitlab-event-types';
import { Repository } from 'typeorm';
import { Project } from '../../entities/project.entity';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private projectsRepository: Repository<Project>,
  ) {}

  async findOneOrCreate(project: GitlabEvents.Project): Promise<Project> {
    const { id: externalId, path_with_namespace: pathWithNamespace } = project;

    try {
      return await this.projectsRepository.findOneByOrFail({
        externalId,
      });
    } catch (error: any) {
      return this.projectsRepository.save({
        pathWithNamespace,
        externalId,
      });
    }
  }
}
