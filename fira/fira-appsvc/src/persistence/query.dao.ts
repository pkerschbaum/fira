import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { TQuery, Query } from './entity/query.entity';
import { failIfUndefined, optionalTransaction, DAO } from './persistence.util';

@Injectable()
export class QueryDAO implements DAO<Query> {
  constructor(
    @InjectRepository(Query)
    public readonly repository: Repository<Query>,
  ) {}

  public findQuery = optionalTransaction(Query)(
    async (
      {
        criteria,
      }: {
        criteria: {
          id: TQuery['id'];
        };
      },
      repository,
    ): Promise<Query | undefined> => {
      return await repository.findOne(criteria.id);
    },
  );

  public findQueryOrFail = failIfUndefined(this.findQuery);

  public count = async (): Promise<number> => {
    return await this.repository.count();
  };
}
