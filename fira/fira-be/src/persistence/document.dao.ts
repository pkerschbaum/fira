import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { TDocument, Document } from './entity/document.entity';
import { failIfUndefined, optionalTransaction, DAO } from './persistence.util';

@Injectable()
export class DocumentDAO implements DAO<Document> {
  constructor(
    @InjectRepository(Document)
    public readonly repository: Repository<Document>,
  ) {}

  public findDocument = optionalTransaction(Document)(
    async (
      {
        criteria,
      }: {
        criteria: {
          id: TDocument['id'];
        };
      },
      repository,
    ): Promise<Document | undefined> => {
      return await repository.findOne(criteria.id);
    },
  );

  public findDocumentOrFail = failIfUndefined(this.findDocument);

  public count = async (): Promise<number> => {
    return await this.repository.count();
  };
}
