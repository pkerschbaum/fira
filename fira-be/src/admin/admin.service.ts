import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Connection } from 'typeorm';

import {
  Document,
  DocumentVersion,
  COLUMN_DOCUMENT_VERSION,
} from './entity/document.entity';
import {
  Query,
  QueryVersion,
  COLUMN_QUERY_VERSION,
} from './entity/query.entity';
import { JudgementPair } from './entity/judgement-pair.entity';
import { Config } from './entity/config.entity';
import { ImportStatus } from '../model/commons.model';
import * as config from '../config';

interface ImportAsset {
  readonly id: number;
  readonly text: string;
}

interface ImportResult {
  readonly id: number;
  readonly status: ImportStatus;
  readonly error?: string;
}

interface ImportJudgementPair {
  readonly documentId: number;
  readonly queryId: number;
  readonly priority: number;
}

interface ImportJudgementPairResult {
  readonly documentId: number;
  readonly queryId: number;
  readonly status: ImportStatus;
  readonly error?: string;
}

interface UpdateConfig {
  readonly annotationTargetPerUser: number;
  readonly annotationTargetPerJudgPair: number;
}

@Injectable()
export class AdminService {
  constructor(
    private readonly connection: Connection,
    @InjectRepository(Config)
    private readonly configRepository: Repository<Config>,
  ) {}

  public async importDocuments(
    documents: ImportAsset[],
  ): Promise<ImportResult[]> {
    return Promise.all(
      documents.map(async document => {
        return this.connection.transaction(async transactionalEntityManager => {
          try {
            let dbDocument = await transactionalEntityManager.findOne(
              Document,
              document.id,
            );
            if (!dbDocument) {
              dbDocument = new Document();
              dbDocument.id = document.id;
            }

            const {
              maxVersionNumber,
            }: { maxVersionNumber: number } = await transactionalEntityManager
              .createQueryBuilder(DocumentVersion, 'document_version')
              .select(
                `MAX(document_version.${COLUMN_DOCUMENT_VERSION})`,
                'maxVersionNumber',
              )
              .where({ document: dbDocument })
              .getRawOne();

            const dbEntry = new DocumentVersion();
            dbEntry.document = dbDocument;
            dbEntry.text = document.text;
            dbEntry.annotateParts = document.text.split(
              config.application.splitRegex,
            );
            if (maxVersionNumber !== undefined && maxVersionNumber !== null) {
              dbEntry.version = maxVersionNumber + 1;
            }

            await transactionalEntityManager.save(DocumentVersion, dbEntry);
            return { id: document.id, status: ImportStatus.SUCCESS };
          } catch (e) {
            return {
              id: document.id,
              status: ImportStatus.ERROR,
              error: e.toString(),
            };
          }
        });
      }),
    );
  }

  public async importQueries(queries: ImportAsset[]): Promise<ImportResult[]> {
    return Promise.all(
      queries.map(async query => {
        return this.connection.transaction(async transactionalEntityManager => {
          try {
            let dbQuery = await transactionalEntityManager.findOne(
              Query,
              query.id,
            );
            if (!dbQuery) {
              dbQuery = new Query();
              dbQuery.id = query.id;
            }

            const {
              maxVersionNumber,
            }: { maxVersionNumber: number } = await transactionalEntityManager
              .createQueryBuilder(QueryVersion, 'query_version')
              .select(
                `MAX(query_version.${COLUMN_QUERY_VERSION})`,
                'maxVersionNumber',
              )
              .where({ query: dbQuery })
              .getRawOne();

            const dbEntry = new QueryVersion();
            dbEntry.query = dbQuery;
            dbEntry.text = query.text;
            if (maxVersionNumber !== undefined && maxVersionNumber !== null) {
              dbEntry.version = maxVersionNumber + 1;
            }

            await transactionalEntityManager.save(QueryVersion, dbEntry);
            return { id: query.id, status: ImportStatus.SUCCESS };
          } catch (e) {
            return {
              id: query.id,
              status: ImportStatus.ERROR,
              error: e.toString(),
            };
          }
        });
      }),
    );
  }

  public async importJudgementPairs<T>(
    judgementPairs: ImportJudgementPair[],
  ): Promise<ImportJudgementPairResult[]> {
    return this.connection.transaction(async transactionalEntityManager => {
      // delete previos pairs
      await transactionalEntityManager
        .createQueryBuilder()
        .delete()
        .from(JudgementPair)
        .execute();

      // insert the new judgement pairs
      return Promise.all(
        judgementPairs.map(async judgementPair => {
          try {
            const documentPromise = transactionalEntityManager.findOne(
              Document,
              judgementPair.documentId,
            );
            const query = await transactionalEntityManager.findOne(
              Query,
              judgementPair.queryId,
            );
            const document = await documentPromise;
            if (!document || !query) {
              return {
                documentId: judgementPair.documentId,
                queryId: judgementPair.queryId,
                status: ImportStatus.ERROR,
                error: `either the document or the query (or both) could not be found. documentFound=${!!document} queryFound=${!!query}`,
              };
            }

            const dbEntry = new JudgementPair();
            dbEntry.document = document;
            dbEntry.query = query;
            dbEntry.priority = judgementPair.priority;
            await transactionalEntityManager.save(dbEntry);
            return {
              documentId: judgementPair.documentId,
              queryId: judgementPair.queryId,
              status: ImportStatus.SUCCESS,
            };
          } catch (e) {
            return {
              documentId: judgementPair.documentId,
              queryId: judgementPair.queryId,
              status: ImportStatus.ERROR,
              error: e.toString(),
            };
          }
        }),
      );
    });
  }

  public async updateConfig<T>(config: UpdateConfig) {
    const dbEntry = new Config();
    dbEntry.annotationTargetPerUser = config.annotationTargetPerUser;
    dbEntry.annotationTargetPerJudgPair = config.annotationTargetPerJudgPair;
    await this.configRepository.save(dbEntry);
  }
}
