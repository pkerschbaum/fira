import { Injectable } from '@nestjs/common';

import * as config from '../config';
import { PersistenceService } from '../persistence/persistence.service';
import { RequestLogger } from '../commons/logger/request-logger';
import { DocumentDAO } from '../persistence/document.dao';
import { DocumentVersionDAO } from '../persistence/document-version.dao';
import { QueryDAO } from '../persistence/query.dao';
import { QueryVersionDAO } from '../persistence/query-version.dao';
import { JudgementPairDAO } from '../persistence/judgement-pair.dao';
import { ConfigDAO } from '../persistence/config.dao';
import {
  ImportAsset,
  ImportResult,
  ImportJudgementPair,
  ImportJudgementPairResult,
  UpdateConfig,
} from '../../../commons';
import { ImportStatus } from '../typings/enums';
import { partitionArray, flatten } from '../util/arrays';

const NUMBER_PARALLEL_IMPORTS = 10;

@Injectable()
export class AdminService {
  constructor(
    private readonly persistenceService: PersistenceService,
    private readonly documentDAO: DocumentDAO,
    private readonly documentVersionDAO: DocumentVersionDAO,
    private readonly queryDAO: QueryDAO,
    private readonly queryVersionDAO: QueryVersionDAO,
    private readonly judgementPairDAO: JudgementPairDAO,
    private readonly configDAO: ConfigDAO,
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
              await this.documentVersionDAO.saveDocumentVersion(
                {
                  data: {
                    documentId: document.id,
                    text: document.text,
                    annotateParts: document.text
                      .split(config.application.splitRegex)
                      .filter((part) => part !== ''),
                  },
                },
                transactionalEntityManager,
              );
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
              await this.queryVersionDAO.saveQueryVersion(
                {
                  data: {
                    queryId: query.id,
                    text: query.text,
                  },
                },
                transactionalEntityManager,
              );
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
      await this.judgementPairDAO.deleteJudgementPairs({}, transactionalEntityManager);

      // create partitions which are processed in parallel
      const partitions = partitionArray(judgementPairs, NUMBER_PARALLEL_IMPORTS);

      // process partitions
      const results = await Promise.all(
        partitions.map(async (partition) => {
          const partitionResults: ImportJudgementPairResult[] = [];

          for (const judgementPair of partition) {
            try {
              const documentPromise = this.documentDAO.findDocument(
                { criteria: { id: judgementPair.documentId } },
                transactionalEntityManager,
              );
              const query = await this.queryDAO.findQuery(
                { criteria: { id: judgementPair.queryId } },
                transactionalEntityManager,
              );
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

              await this.judgementPairDAO.saveJudgementPair(
                { data: { document, query, priority: judgementPair.priority } },
                transactionalEntityManager,
              );
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
    await this.configDAO.updateConfig(config);
  };

  public getCountOfDocuments = async (): Promise<number> => {
    return await this.documentDAO.count();
  };

  public getCountOfQueries = async (): Promise<number> => {
    return await this.queryDAO.count();
  };

  public getCountOfJudgPairs = async (): Promise<number> => {
    return await this.judgementPairDAO.count();
  };

  public getCountOfConfig = async (): Promise<number> => {
    return await this.configDAO.count();
  };
}
