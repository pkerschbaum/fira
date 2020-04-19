import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';

import {
  TQuery,
  Query,
  TQueryVersion,
  QueryVersion,
  COLUMN_QUERY_VERSION,
} from './entity/query.entity';
import { failIfUndefined } from './persistence.util';

@Injectable()
export class QueryDAO {
  constructor(
    @InjectRepository(Query)
    private readonly queryRepository: Repository<Query>,
    @InjectRepository(QueryVersion)
    private readonly queryVersionRepository: Repository<QueryVersion>,
  ) {}

  public findQuery = async (
    criteria: {
      id: TQuery['id'];
    },
    transactionalEM?: EntityManager,
  ): Promise<Query | undefined> => {
    const repository =
      transactionalEM !== undefined ? transactionalEM.getRepository(Query) : this.queryRepository;
    return await repository.findOne(criteria.id);
  };

  public findQueryOrFail = failIfUndefined(this.findQuery);

  public saveQueryVersion = async (
    data: Pick<TQueryVersion, 'text'> & { queryId: TQuery['id'] },
    transactionalEM?: EntityManager,
  ): Promise<void> => {
    const repository =
      transactionalEM !== undefined
        ? transactionalEM.getRepository(QueryVersion)
        : this.queryVersionRepository;

    let dbQuery = await this.findQuery({ id: data.queryId }, transactionalEM);
    if (!dbQuery) {
      dbQuery = new Query();
      dbQuery.id = data.queryId;
    }

    const maxVersionNumber = await this.findMaxQueryVersion(dbQuery, transactionalEM);

    const dbEntry = new QueryVersion();
    dbEntry.query = dbQuery;
    dbEntry.text = data.text;
    if (maxVersionNumber !== undefined && maxVersionNumber !== null) {
      dbEntry.version = maxVersionNumber + 1;
    }

    await repository.save(dbEntry);
  };

  public findMaxQueryVersion = async (dbQuery: Query, transactionalEM?: EntityManager) => {
    const repository =
      transactionalEM !== undefined
        ? transactionalEM.getRepository(QueryVersion)
        : this.queryVersionRepository;

    const { maxVersionNumber }: { maxVersionNumber: number } = await repository
      .createQueryBuilder('query_version')
      .select(`MAX(query_version.${COLUMN_QUERY_VERSION})`, 'maxVersionNumber')
      .where({ query: dbQuery })
      .getRawOne();

    return maxVersionNumber;
  };

  public findCurrentQueryVersion = async (
    dbQuery: Query,
    transactionalEM?: EntityManager,
  ): Promise<QueryVersion> => {
    const repository =
      transactionalEM !== undefined
        ? transactionalEM.getRepository(QueryVersion)
        : this.queryVersionRepository;

    const currentVersion = await this.findMaxQueryVersion(dbQuery, transactionalEM);
    return repository.findOneOrFail({
      query: dbQuery,
      version: currentVersion,
    });
  };

  public count = async (): Promise<number> => {
    return await this.queryRepository.count();
  };
}
