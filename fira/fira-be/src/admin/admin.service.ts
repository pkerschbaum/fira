import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Connection } from 'typeorm';

import * as config from '../config';
import { PersistenceService } from '../persistence/persistence.service';
import { RequestLogger } from '../commons/request-logger.service';
import {
  ImportAsset,
  ImportResult,
  ImportJudgementPair,
  ImportJudgementPairResult,
  UpdateConfig,
} from '../../../commons';
import { ImportStatus } from '../typings/enums';
import { Document, DocumentVersion } from './entity/document.entity';
import { Query, QueryVersion } from './entity/query.entity';
import { JudgementPair } from './entity/judgement-pair.entity';
import { Config } from './entity/config.entity';
import { assetUtil } from './asset.util';
import { partitionArray, flatten } from '../util/arrays';

const NUMBER_PARALLEL_IMPORTS = 10;

@Injectable()
export class AdminService {
  constructor(
    private readonly connection: Connection,
    private readonly persistenceService: PersistenceService,
    @InjectRepository(Config)
    private readonly configRepository: Repository<Config>,
    private readonly requestLogger: RequestLogger,
  ) {}

  public importDocuments = this.persistenceService.wrapInTransaction(this.requestLogger)(
    async (transactionalEntityManager, documents: ImportAsset[]): Promise<ImportResult[]> => {
      // create partitions which are processed in parallel
      const partitions = partitionArray(documents, NUMBER_PARALLEL_IMPORTS);

      // process partitions
      const results = await Promise.all(
        partitions.map(async (partition) => {
          const partitionResults: ImportResult[] = [];

          for (const document of partition) {
            try {
              let dbDocument = await transactionalEntityManager.findOne(Document, document.id);
              if (!dbDocument) {
                dbDocument = new Document();
                dbDocument.id = document.id;
              }

              const maxVersionNumber = await assetUtil.findMaxDocumentVersion(
                dbDocument,
                transactionalEntityManager,
              );

              const dbEntry = new DocumentVersion();
              dbEntry.document = dbDocument;
              dbEntry.text = document.text;
              dbEntry.annotateParts = document.text
                .split(config.application.splitRegex)
                .filter((part) => part !== '');
              if (maxVersionNumber !== undefined && maxVersionNumber !== null) {
                dbEntry.version = maxVersionNumber + 1;
              }

              await transactionalEntityManager.save(DocumentVersion, dbEntry);
              partitionResults.push({ id: document.id, status: ImportStatus.SUCCESS });
            } catch (e) {
              partitionResults.push({
                id: document.id,
                status: ImportStatus.ERROR,
                error: e.toString(),
              });
            }
          }

          return partitionResults;
        }),
      );

      // return flattened results
      return flatten(results);
    },
  );

  public importQueries = this.persistenceService.wrapInTransaction(this.requestLogger)(
    async (transactionalEntityManager, queries: ImportAsset[]): Promise<ImportResult[]> => {
      // create partitions which are processed in parallel
      const partitions = partitionArray(queries, NUMBER_PARALLEL_IMPORTS);

      // process partitions
      const results = await Promise.all(
        partitions.map(async (partition) => {
          const partitionResults: ImportResult[] = [];

          for (const query of partition) {
            try {
              let dbQuery = await transactionalEntityManager.findOne(Query, query.id);
              if (!dbQuery) {
                dbQuery = new Query();
                dbQuery.id = query.id;
              }

              const maxVersionNumber = await assetUtil.findMaxQueryVersion(
                dbQuery,
                transactionalEntityManager,
              );

              const dbEntry = new QueryVersion();
              dbEntry.query = dbQuery;
              dbEntry.text = query.text;
              if (maxVersionNumber !== undefined && maxVersionNumber !== null) {
                dbEntry.version = maxVersionNumber + 1;
              }

              await transactionalEntityManager.save(QueryVersion, dbEntry);
              partitionResults.push({ id: query.id, status: ImportStatus.SUCCESS });
            } catch (e) {
              partitionResults.push({
                id: query.id,
                status: ImportStatus.ERROR,
                error: e.toString(),
              });
            }
          }

          return partitionResults;
        }),
      );

      // return flattened results
      return flatten(results);
    },
  );

  public importJudgementPairs = this.persistenceService.wrapInTransaction(this.requestLogger)(
    async (
      transactionalEntityManager,
      judgementPairs: ImportJudgementPair[],
    ): Promise<ImportJudgementPairResult[]> => {
      // delete previous pairs
      await transactionalEntityManager.createQueryBuilder().delete().from(JudgementPair).execute();

      // create partitions which are processed in parallel
      const partitions = partitionArray(judgementPairs, NUMBER_PARALLEL_IMPORTS);

      // process partitions
      const results = await Promise.all(
        partitions.map(async (partition) => {
          const partitionResults: ImportJudgementPairResult[] = [];

          for (const judgementPair of partition) {
            try {
              const documentPromise = transactionalEntityManager.findOne(
                Document,
                judgementPair.documentId,
              );
              const query = await transactionalEntityManager.findOne(Query, judgementPair.queryId);
              const document = await documentPromise;
              if (!document || !query) {
                partitionResults.push({
                  documentId: judgementPair.documentId,
                  queryId: judgementPair.queryId,
                  status: ImportStatus.ERROR,
                  error:
                    `either the document or the query (or both) could not be found. documentFound=${!!document}, queryFound=${!!query},` +
                    ` documentId=${judgementPair.documentId}, queryId=${judgementPair.queryId}`,
                });
                continue;
              }

              const dbEntry = new JudgementPair();
              dbEntry.document = document;
              dbEntry.query = query;
              dbEntry.priority = judgementPair.priority;
              await transactionalEntityManager.save(dbEntry);
              partitionResults.push({
                documentId: judgementPair.documentId,
                queryId: judgementPair.queryId,
                status: ImportStatus.SUCCESS,
              });
            } catch (e) {
              partitionResults.push({
                documentId: judgementPair.documentId,
                queryId: judgementPair.queryId,
                status: ImportStatus.ERROR,
                error: e.toString(),
              });
            }
          }

          return partitionResults;
        }),
      );

      // return flattened results
      return flatten(results);
    },
  );

  public updateConfig = async (config: UpdateConfig): Promise<void> => {
    const dbEntry = new Config();
    if (config.annotationTargetPerUser !== undefined) {
      dbEntry.annotationTargetPerUser = config.annotationTargetPerUser;
    }
    if (config.annotationTargetPerJudgPair !== undefined) {
      dbEntry.annotationTargetPerJudgPair = config.annotationTargetPerJudgPair;
    }
    if (config.judgementMode !== undefined) {
      dbEntry.judgementMode = config.judgementMode;
    }
    if (config.rotateDocumentText !== undefined) {
      dbEntry.rotateDocumentText = config.rotateDocumentText;
    }
    if (config.annotationTargetToRequireFeedback !== undefined) {
      dbEntry.annotationTargetToRequireFeedback = config.annotationTargetToRequireFeedback;
    }
    await this.configRepository.save(dbEntry);
  };

  public getCountOfDocuments = (): Promise<number> => {
    return this.connection.getRepository(Document).count();
  };

  public getCountOfQueries = (): Promise<number> => {
    return this.connection.getRepository(Query).count();
  };

  public getCountOfJudgPairs = (): Promise<number> => {
    return this.connection.getRepository(JudgementPair).count();
  };

  public getCountOfConfig = (): Promise<number> => {
    return this.connection.getRepository(Config).count();
  };
}
