import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Connection } from 'typeorm';

import { Document } from './entity/document.entity';
import { Query } from './entity/query.entity';
import { JudgementPair } from './entity/judgement-pair.entity';
import { Config } from './entity/config.entity';
import { ImportStatus } from '../model/commons.model';

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
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,
    @InjectRepository(Query)
    private readonly queryRepository: Repository<Query>,
    @InjectRepository(Config)
    private readonly configRepository: Repository<Config>,
  ) {}

  public async importDocuments(
    documents: ImportAsset[],
  ): Promise<ImportResult[]> {
    return this.importAssets(documents, Document, this.documentRepository);
  }

  public async importQueries(queries: ImportAsset[]): Promise<ImportResult[]> {
    return this.importAssets(queries, Query, this.queryRepository);
  }

  private async importAssets<T>(
    assets: ImportAsset[],
    entityConstructor: any,
    repository: Repository<T>,
  ) {
    return Promise.all(
      assets.map(async asset => {
        try {
          const dbEntry = new entityConstructor();
          dbEntry.id = asset.id;
          dbEntry.text = asset.text;
          await repository.save(dbEntry);
          return { id: asset.id, status: ImportStatus.SUCCESS };
        } catch (e) {
          return {
            id: asset.id,
            status: ImportStatus.ERROR,
            error: e.toString(),
          };
        }
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
            const [document, query] = await Promise.all([
              transactionalEntityManager.findOne(
                Document,
                judgementPair.documentId,
              ),
              transactionalEntityManager.findOne(Query, judgementPair.queryId),
            ]);
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
