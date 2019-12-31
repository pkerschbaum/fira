import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Document } from './entity/document.entity';
import { ImportStatus } from '../model/commons.model';

interface ImportDocument {
  readonly id: number;
  readonly text: string;
}

interface ImportResult {
  readonly id: number;
  readonly status: ImportStatus;
  readonly error?: string;
}

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,
  ) {}

  public async importDocuments(
    documents: ImportDocument[],
  ): Promise<ImportResult[]> {
    return Promise.all(
      documents.map(async document => {
        try {
          const dbDoc = new Document();
          dbDoc.id = document.id;
          dbDoc.text = document.text;
          await this.documentRepository.save(dbDoc);
          return { id: document.id, status: ImportStatus.SUCCESS };
        } catch (e) {
          return {
            id: document.id,
            status: ImportStatus.ERROR,
            error: e.toString(),
          };
        }
      }),
    );
  }
}
