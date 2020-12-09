import { Injectable } from '@nestjs/common';

import * as config from '../config';
import { DocumentsDAO } from '../persistence/daos/documents.dao';
import { DocumentVersionsDAO } from '../persistence/daos/document-versions.dao';
import { QueriesDAO } from '../persistence/daos/queries.dao';
import { QueryVersionsDAO } from '../persistence/daos/query-versions.dao';
import { JudgementPairsDAO } from '../persistence/daos/judgement-pairs.dao';
import { ConfigsDAO } from '../persistence/daos/configs.dao';
import { adminSchema, arrays } from '@fira-commons';
import { PrismaClient } from '@fira-commons/database/prisma';

const IMPORT_CHUNK_SIZE = 1000;

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly documentsDAO: DocumentsDAO,
    private readonly documentVersionsDAO: DocumentVersionsDAO,
    private readonly queriesDAO: QueriesDAO,
    private readonly queryVersionsDAO: QueryVersionsDAO,
    private readonly judgementPairsDAO: JudgementPairsDAO,
    private readonly configsDAO: ConfigsDAO,
  ) {}

  /**
   * because of https://github.com/prisma/prisma/issues/3892, we have to split the whole dataset into
   * multiple chunks, and import them one after the other sequentially.
   * If any import of the chunks fails, we delete everything.
   */
  public importDocuments = async (documents: adminSchema.ImportAsset[]) => {
    const partitions = arrays.partitionArray(documents, { itemsPerPartition: IMPORT_CHUNK_SIZE });

    try {
      for (const partition of partitions) {
        const createStatements = partition.map((document) =>
          this.documentVersionsDAO.create({
            data: {
              document: { create: { id: document.id } },
              text: document.text,
              annotate_parts: document.text
                .split(config.application.splitRegex)
                .filter((part) => part !== ''),
            },
          }),
        );

        await this.prisma.$transaction(createStatements);
      }
    } catch (error) {
      // if any import of the chunks fails, delete everything
      await this.documentsDAO.deleteMany({});
      throw error;
    }
  };

  /**
   * See documentation of importDocuments
   */
  public importQueries = async (queries: adminSchema.ImportAsset[]) => {
    const partitions = arrays.partitionArray(queries, { itemsPerPartition: IMPORT_CHUNK_SIZE });

    try {
      for (const partition of partitions) {
        const createStatements = partition.map((query) =>
          this.queryVersionsDAO.create({
            data: {
              query: { create: { id: query.id } },
              text: query.text,
            },
          }),
        );

        await this.prisma.$transaction(createStatements);
      }
    } catch (error) {
      // if any import of the chunks fails, delete everything
      await this.queriesDAO.deleteMany({});
      throw error;
    }
  };

  /**
   * See documentation of importDocuments
   */
  public importJudgementPairs = async (judgementPairs: adminSchema.ImportJudgementPair[]) => {
    const partitions = arrays.partitionArray(judgementPairs, {
      itemsPerPartition: IMPORT_CHUNK_SIZE,
    });

    try {
      for (const partition of partitions) {
        const createStatements = partition.map((judgementPair) =>
          this.judgementPairsDAO.create({
            data: {
              document: { connect: { id: judgementPair.documentId } },
              query: { connect: { id: judgementPair.queryId } },
              priority: judgementPair.priority,
            },
          }),
        );

        await this.prisma.$transaction(createStatements);
      }
    } catch (error) {
      // if any import of the chunks fails, delete everything
      await this.judgementPairsDAO.deleteMany({});
      throw error;
    }
  };

  public createConfig = async (config: adminSchema.CreateConfig) => {
    await this.configsDAO.create({
      data: {
        annotation_target_per_user: config.annotationTargetPerUser,
        annotation_target_per_judg_pair: config.annotationTargetPerJudgPair,
        judgement_mode: config.judgementMode,
        rotate_document_text: config.rotateDocumentText,
        annotation_target_to_require_feedback: config.annotationTargetToRequireFeedback,
      },
    });
  };

  public updateConfig = async (config: adminSchema.UpdateConfig) => {
    await this.configsDAO.update({
      where: { id: 1 },
      data: {
        annotation_target_per_user: config.annotationTargetPerUser,
        annotation_target_per_judg_pair: config.annotationTargetPerJudgPair,
        judgement_mode: config.judgementMode,
        rotate_document_text: config.rotateDocumentText,
        annotation_target_to_require_feedback: config.annotationTargetToRequireFeedback,
      },
    });
  };

  public getCountOfDocuments = async (): Promise<number> => {
    return await this.documentsDAO.count();
  };

  public getCountOfQueries = async (): Promise<number> => {
    return await this.queriesDAO.count();
  };

  public getCountOfJudgPairs = async (): Promise<number> => {
    return await this.judgementPairsDAO.count();
  };

  public getCountOfConfig = async (): Promise<number> => {
    return await this.configsDAO.count();
  };
}
