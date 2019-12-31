import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { Document } from './entity/document.entity';
import { Query } from './entity/query.entity';
import { IdentityManagementModule } from '../identity-management/identity-management.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Document, Query]),
    IdentityManagementModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
