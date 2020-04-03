import { EntityManager } from 'typeorm';

import { Document, DocumentVersion, COLUMN_DOCUMENT_VERSION } from './entity/document.entity';
import { Query, QueryVersion, COLUMN_QUERY_VERSION } from './entity/query.entity';

export const assetUtil = {
  findMaxDocumentVersion: async (dbDocument: Document, entityManager: EntityManager) => {
    const {
      maxVersionNumber,
    }: { maxVersionNumber: number } = await entityManager
      .createQueryBuilder(DocumentVersion, 'document_version')
      .select(`MAX(document_version.${COLUMN_DOCUMENT_VERSION})`, 'maxVersionNumber')
      .where({ document: dbDocument })
      .getRawOne();
    return maxVersionNumber;
  },

  findMaxQueryVersion: async (dbQuery: Query, entityManager: EntityManager) => {
    const {
      maxVersionNumber,
    }: { maxVersionNumber: number } = await entityManager
      .createQueryBuilder(QueryVersion, 'query_version')
      .select(`MAX(query_version.${COLUMN_QUERY_VERSION})`, 'maxVersionNumber')
      .where({ query: dbQuery })
      .getRawOne();

    return maxVersionNumber;
  },

  findCurrentDocumentVersion: async (
    dbDocument: Document,
    entityManager: EntityManager,
  ): Promise<DocumentVersion> => {
    const currentVersion = await assetUtil.findMaxDocumentVersion(dbDocument, entityManager);
    return entityManager.findOneOrFail(DocumentVersion, {
      document: dbDocument,
      version: currentVersion,
    });
  },

  findCurrentQueryVersion: async (
    dbQuery: Query,
    entityManager: EntityManager,
  ): Promise<QueryVersion> => {
    const currentVersion = await assetUtil.findMaxQueryVersion(dbQuery, entityManager);
    return entityManager.findOneOrFail(QueryVersion, {
      query: dbQuery,
      version: currentVersion,
    });
  },
};
