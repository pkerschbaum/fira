import {
  Controller,
  Body,
  Put,
  UseGuards,
  Headers,
  Post,
  HttpException,
  Get,
} from '@nestjs/common';
import { ApiTags, ApiHeader } from '@nestjs/swagger';

import * as config from '../config';
import { AdminService } from './admin.service';
import { IdentityManagementService } from '../identity-management/identity-management.service';
import { ImportDocumentsReqDto, ImportDocumentsRespDto } from './dto/import-documents.dto';
import { ImportUsersRequestDto, ImportUsersResponseDto } from './dto/create-user.dto';
import { ImportQueriesReqDto, ImportQueriesRespDto } from './dto/import-queries.dto';
import {
  ImportJudgementPairsReqDto,
  ImportJudgementPairsRespDto,
} from './dto/import-judgement-pairs.dto';
import { UpdateConfigReqDto } from './dto/update-config.dto';
import { Roles } from '../roles.decorator';
import { RolesGuard } from '../roles.guard';
import { JudgementsService } from '../judgements/judgements.service';
import { ExportJudgementsResponseDto } from './dto/export-judgements.dto';

@ApiTags('admin')
@Controller('admin')
@Roles(config.keycloak.adminRole)
@UseGuards(RolesGuard)
@ApiHeader({
  name: 'authorization',
  required: true,
})
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly imService: IdentityManagementService,
    private readonly judgementsService: JudgementsService,
  ) {}

  @Post('v1/import/users')
  async importUsers(
    @Body() importUsersRequest: ImportUsersRequestDto,
    @Headers('authorization') authHeader: string,
  ): Promise<ImportUsersResponseDto> {
    if (!authHeader) {
      throw new HttpException('access token required in header', 401);
    }
    const accessToken = /Bearer (.+)/.exec(authHeader)?.[1];
    if (!accessToken) {
      throw new HttpException('access token required in header', 401);
    }
    return {
      importedUsers: await this.imService.importUsers(accessToken, importUsersRequest.users),
    };
  }

  @Put('v1/import/documents')
  async importDocuments(
    @Body() importDocsRequest: ImportDocumentsReqDto,
  ): Promise<ImportDocumentsRespDto> {
    return {
      importedDocuments: await this.adminService.importDocuments(importDocsRequest.documents),
    };
  }

  @Put('v1/import/queries')
  async importQueries(
    @Body() importQueriesReq: ImportQueriesReqDto,
  ): Promise<ImportQueriesRespDto> {
    return {
      importedQueries: await this.adminService.importQueries(importQueriesReq.queries),
    };
  }

  @Put('v1/import/judgement-pairs')
  async importJudgementPairs(
    @Body() importJudgementPairsReq: ImportJudgementPairsReqDto,
  ): Promise<ImportJudgementPairsRespDto> {
    return {
      importedJudgementPairs: await this.adminService.importJudgementPairs(
        importJudgementPairsReq.judgementPairs,
      ),
    };
  }

  @Put('v1/config')
  async updateConfig(@Body() updateConfigReq: UpdateConfigReqDto) {
    await this.adminService.updateConfig(updateConfigReq);
  }

  @Get('v1/judgements/export')
  async exportJudgements(): Promise<ExportJudgementsResponseDto> {
    return { judgements: await this.judgementsService.exportJudgements() };
  }
}
