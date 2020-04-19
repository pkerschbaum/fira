import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';

import { TConfig, Config } from './entity/config.entity';
import { failIfUndefined } from './persistence.util';

@Injectable()
export class ConfigDAO {
  constructor(
    @InjectRepository(Config)
    private readonly configRepository: Repository<Config>,
  ) {}

  public findConfig = async (transactionalEM?: EntityManager): Promise<Config | undefined> => {
    const repository =
      transactionalEM !== undefined ? transactionalEM.getRepository(Config) : this.configRepository;

    return await repository.findOne();
  };

  public findConfigOrFail = failIfUndefined(this.findConfig);

  public updateConfig = async (data: Partial<TConfig>): Promise<void> => {
    const dbEntry = new Config();
    if (data.annotationTargetPerUser !== undefined) {
      dbEntry.annotationTargetPerUser = data.annotationTargetPerUser;
    }
    if (data.annotationTargetPerJudgPair !== undefined) {
      dbEntry.annotationTargetPerJudgPair = data.annotationTargetPerJudgPair;
    }
    if (data.judgementMode !== undefined) {
      dbEntry.judgementMode = data.judgementMode;
    }
    if (data.rotateDocumentText !== undefined) {
      dbEntry.rotateDocumentText = data.rotateDocumentText;
    }
    if (data.annotationTargetToRequireFeedback !== undefined) {
      dbEntry.annotationTargetToRequireFeedback = data.annotationTargetToRequireFeedback;
    }
    await this.configRepository.save(dbEntry);
  };

  public count = async (): Promise<number> => {
    return await this.configRepository.count();
  };
}
