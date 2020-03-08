import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Connection } from 'typeorm';

import {
  ImportAsset,
  ImportResult,
  ImportJudgementPair,
  ImportJudgementPairResult,
  UpdateConfig,
} from './admin.types';
import { ImportStatus } from '../typings/enums';
import { Document, DocumentVersion } from './entity/document.entity';
import { Query, QueryVersion } from './entity/query.entity';
import { JudgementPair } from './entity/judgement-pair.entity';
import { Config } from './entity/config.entity';
import * as config from '../config';
import { assetUtil } from './asset.util';

@Injectable()
export class AdminService {
  constructor(
    private readonly connection: Connection,
    @InjectRepository(Config)
    private readonly configRepository: Repository<Config>,
  ) {}

  public importDocuments: (documents: ImportAsset[]) => Promise<ImportResult[]> = documents => {
    return Promise.all(
      documents.map(async document => {
        return this.connection.transaction(async transactionalEntityManager => {
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
              .filter(part => part !== '');
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
  };

  public importQueries: (queries: ImportAsset[]) => Promise<ImportResult[]> = queries => {
    return Promise.all(
      queries.map(async query => {
        return this.connection.transaction(async transactionalEntityManager => {
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
  };

  public importJudgementPairs: (
    judgementPairs: ImportJudgementPair[],
  ) => Promise<ImportJudgementPairResult[]> = judgementPairs => {
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
            const query = await transactionalEntityManager.findOne(Query, judgementPair.queryId);
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
  };

  public updateConfig: (config: UpdateConfig) => Promise<void> = async config => {
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

  public getCountOfDocuments: () => Promise<number> = () => {
    return this.connection.getRepository(Document).count();
  };

  public getCountOfQueries: () => Promise<number> = () => {
    return this.connection.getRepository(Query).count();
  };

  public getCountOfJudgPairs: () => Promise<number> = () => {
    return this.connection.getRepository(JudgementPair).count();
  };

  public getCountOfConfig: () => Promise<number> = () => {
    return this.connection.getRepository(Config).count();
  };
}
