import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';

import {
  TDocument,
  Document,
  TDocumentVersion,
  DocumentVersion,
  COLUMN_DOCUMENT_VERSION,
} from './entity/document.entity';
import { failIfUndefined } from './persistence.util';

@Injectable()
export class DocumentDAO {
  constructor(
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,
    @InjectRepository(DocumentVersion)
    private readonly documentVersionRepository: Repository<DocumentVersion>,
  ) {}

  public findDocument = async (
    criteria: {
      id: TDocument['id'];
    },
    transactionalEM?: EntityManager,
  ): Promise<Document | undefined> => {
    const repository =
      transactionalEM !== undefined
        ? transactionalEM.getRepository(Document)
        : this.documentRepository;
    return await repository.findOne(criteria.id);
  };

  public findDocumentOrFail = failIfUndefined(this.findDocument);

  public saveDocumentVersion = async (
    data: Pick<TDocumentVersion, 'text' | 'annotateParts'> & { documentId: TDocument['id'] },
    transactionalEM?: EntityManager,
  ): Promise<void> => {
    const repository =
      transactionalEM !== undefined
        ? transactionalEM.getRepository(DocumentVersion)
        : this.documentVersionRepository;

    let dbDocument = await this.findDocument({ id: data.documentId }, transactionalEM);
    if (!dbDocument) {
      dbDocument = new Document();
      dbDocument.id = data.documentId;
    }

    const maxVersionNumber = await this.findMaxDocumentVersion(dbDocument, transactionalEM);

    const dbEntry = new DocumentVersion();
    dbEntry.document = dbDocument;
    dbEntry.text = data.text;
    dbEntry.annotateParts = data.annotateParts;
    if (maxVersionNumber !== undefined && maxVersionNumber !== null) {
      dbEntry.version = maxVersionNumber + 1;
    }

    await repository.save(dbEntry);
  };

  public findMaxDocumentVersion = async (
    dbDocument: Document,
    transactionalEM?: EntityManager,
  ): Promise<number> => {
    const repository =
      transactionalEM !== undefined
        ? transactionalEM.getRepository(DocumentVersion)
        : this.documentVersionRepository;

    const { maxVersionNumber }: { maxVersionNumber: number } = await repository
      .createQueryBuilder('document_version')
      .select(`MAX(document_version.${COLUMN_DOCUMENT_VERSION})`, 'maxVersionNumber')
      .where({ document: dbDocument })
      .getRawOne();
    return maxVersionNumber;
  };

  public findCurrentDocumentVersion = async (
    dbDocument: Document,
    transactionalEM?: EntityManager,
  ): Promise<DocumentVersion> => {
    const repository =
      transactionalEM !== undefined
        ? transactionalEM.getRepository(DocumentVersion)
        : this.documentVersionRepository;

    const currentVersion = await this.findMaxDocumentVersion(dbDocument, transactionalEM);
    return repository.findOneOrFail({
      document: dbDocument,
      version: currentVersion,
    });
  };

  public count = async (): Promise<number> => {
    return await this.documentRepository.count();
  };
}
