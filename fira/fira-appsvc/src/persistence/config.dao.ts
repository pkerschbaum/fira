import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { TConfig, Config } from './entity/config.entity';
import { failIfUndefined, optionalTransaction, DAO } from './persistence.util';

@Injectable()
export class ConfigDAO implements DAO<Config> {
  constructor(
    @InjectRepository(Config)
    public readonly repository: Repository<Config>,
  ) {}

  public findConfig = optionalTransaction(Config)(
    async (_, repository): Promise<Config | undefined> => {
      return await repository.findOne();
    },
  );

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
    await this.repository.save(dbEntry);
  };

  public count = async (): Promise<number> => {
    return await this.repository.count();
  };
}
