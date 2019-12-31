import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Document } from './entity/document.entity';
import { Query } from './entity/query.entity';
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

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,
    @InjectRepository(Query)
    private readonly queryRepository: Repository<Query>,
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
}
