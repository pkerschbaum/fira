import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  TDocument,
  Document,
  TDocumentVersion,
  DocumentVersion,
  COLUMN_DOCUMENT_VERSION,
} from './entity/document.entity';
import { optionalTransaction, DAO } from './persistence.util';
import { DocumentDAO } from './document.dao';

@Injectable()
export class DocumentVersionDAO implements DAO<DocumentVersion> {
  constructor(
    @InjectRepository(DocumentVersion)
    public readonly repository: Repository<DocumentVersion>,
    private readonly documentDAO: DocumentDAO,
  ) {}

  public saveDocumentVersion = optionalTransaction(DocumentVersion)(
    async (
      {
        data,
      }: {
        data: Pick<TDocumentVersion, 'text' | 'annotateParts'> & { documentId: TDocument['id'] };
      },
      repository,
      transactionalEM,
    ): Promise<void> => {
      let dbDocument = await this.documentDAO.findDocument(
        { criteria: { id: data.documentId } },
        transactionalEM,
      );
      if (!dbDocument) {
        dbDocument = new Document();
        dbDocument.id = data.documentId;
      }

      const maxVersionNumber = await this.findMaxDocumentVersion(
        { criteria: { dbDocument } },
        transactionalEM,
      );

      const dbEntry = new DocumentVersion();
      dbEntry.document = dbDocument;
      dbEntry.text = data.text;
      dbEntry.annotateParts = data.annotateParts;
      if (maxVersionNumber !== undefined && maxVersionNumber !== null) {
        dbEntry.version = maxVersionNumber + 1;
      }

      await repository.save(dbEntry);
    },
  );

  public findMaxDocumentVersion = optionalTransaction(DocumentVersion)(
    async ({ criteria }: { criteria: { dbDocument: Document } }, repository): Promise<number> => {
      const {
        maxVersionNumber,
      }: { maxVersionNumber: number } = await repository
        .createQueryBuilder('document_version')
        .select(`MAX(document_version.${COLUMN_DOCUMENT_VERSION})`, 'maxVersionNumber')
        .where({ document: criteria.dbDocument })
        .getRawOne();

      return maxVersionNumber;
    },
  );

  public findCurrentDocumentVersion = optionalTransaction(DocumentVersion)(
    async (
      { criteria }: { criteria: { dbDocument: Document } },
      repository,
      transactionalEM,
    ): Promise<DocumentVersion> => {
      const currentVersion = await this.findMaxDocumentVersion({ criteria }, transactionalEM);
      return repository.findOneOrFail({
        document: criteria.dbDocument,
        version: currentVersion,
      });
    },
  );
}
