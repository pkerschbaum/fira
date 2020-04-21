import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  TQuery,
  Query,
  TQueryVersion,
  QueryVersion,
  COLUMN_QUERY_VERSION,
} from './entity/query.entity';
import { QueryDAO } from './query.dao';
import { optionalTransaction, DAO } from './persistence.util';

@Injectable()
export class QueryVersionDAO implements DAO<QueryVersion> {
  constructor(
    @InjectRepository(QueryVersion)
    public readonly repository: Repository<QueryVersion>,
    private readonly queryDAO: QueryDAO,
  ) {}

  public saveQueryVersion = optionalTransaction(QueryVersion)(
    async (
      { data }: { data: Pick<TQueryVersion, 'text'> & { queryId: TQuery['id'] } },
      repository,
      transactionalEM,
    ): Promise<void> => {
      let dbQuery = await this.queryDAO.findQuery(
        { criteria: { id: data.queryId } },
        transactionalEM,
      );
      if (!dbQuery) {
        dbQuery = new Query();
        dbQuery.id = data.queryId;
      }

      const maxVersionNumber = await this.findMaxQueryVersion(
        { criteria: { dbQuery } },
        transactionalEM,
      );

      const dbEntry = new QueryVersion();
      dbEntry.query = dbQuery;
      dbEntry.text = data.text;
      if (maxVersionNumber !== undefined && maxVersionNumber !== null) {
        dbEntry.version = maxVersionNumber + 1;
      }

      await repository.save(dbEntry);
    },
  );

  public findMaxQueryVersion = optionalTransaction(QueryVersion)(
    async ({ criteria }: { criteria: { dbQuery: Query } }, repository) => {
      const {
        maxVersionNumber,
      }: { maxVersionNumber: number } = await repository
        .createQueryBuilder('query_version')
        .select(`MAX(query_version.${COLUMN_QUERY_VERSION})`, 'maxVersionNumber')
        .where({ query: criteria.dbQuery })
        .getRawOne();

      return maxVersionNumber;
    },
  );

  public findCurrentQueryVersion = optionalTransaction(QueryVersion)(
    async (
      { criteria }: { criteria: { dbQuery: Query } },
      repository,
      transactionalEM,
    ): Promise<QueryVersion> => {
      const currentVersion = await this.findMaxQueryVersion({ criteria }, transactionalEM);
      return repository.findOneOrFail({
        query: criteria.dbQuery,
        version: currentVersion,
      });
    },
  );
}
