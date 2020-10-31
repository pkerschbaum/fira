import {
  Controller,
  Body,
  Put,
  UseGuards,
  Headers,
  Post,
  HttpException,
  Get,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiHeader, ApiResponse } from '@nestjs/swagger';

import * as config from '../config';
import { ZodValidationPipe } from '../commons/zod-schema-validation.pipe';
import { AdminService } from './admin.service';
import { IdentityManagementService } from '../identity-management/identity-management.service';
import { Roles } from '../roles.decorator';
import { RolesGuard } from '../roles.guard';
import { JudgementsService } from '../judgements/judgements.service';
import { FeedbackService } from '../feedback/feedback.service';
import {
  basePaths,
  ImportDocuments,
  importDocumentsSchema,
  ImportJudgementPairs,
  importJudgementPairsSchema,
  ImportQueries,
  importQueriesSchema,
  ImportUsers,
  importUsersSchema,
  UpdateConfig,
  updateConfigReqSchema,
  ExportJudgements,
  ExportFeedback,
  LoadStatistics,
} from '../../../fira-commons/src/rest';

@ApiTags(basePaths.admin)
@Controller(basePaths.admin)
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
    private readonly feedbackService: FeedbackService,
  ) {}

  @Post('v1/import/users')
  public async importUsers(
    @Body(new ZodValidationPipe(importUsersSchema.shape.request.shape.data))
    importUsersRequest: ImportUsers['request']['data'],
    @Headers('authorization') authHeader: string,
  ): Promise<ImportUsers['response']> {
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
  public async importDocuments(
    @Body(new ZodValidationPipe(importDocumentsSchema.shape.request.shape.data))
    importDocsRequest: ImportDocuments['request']['data'],
  ): Promise<ImportDocuments['response']> {
    return {
      importedDocuments: await this.adminService.importDocuments(importDocsRequest.documents),
    };
  }

  @Put('v1/import/queries')
  public async importQueries(
    @Body(new ZodValidationPipe(importQueriesSchema.shape.request.shape.data))
    importQueriesReq: ImportQueries['request']['data'],
  ): Promise<ImportQueries['response']> {
    return {
      importedQueries: await this.adminService.importQueries(importQueriesReq.queries),
    };
  }

  @Put('v1/import/judgement-pairs')
  public async importJudgementPairs(
    @Body(new ZodValidationPipe(importJudgementPairsSchema.shape.request.shape.data))
    importJudgementPairsReq: ImportJudgementPairs['request']['data'],
  ): Promise<ImportJudgementPairs['response']> {
    return {
      importedJudgementPairs: await this.adminService.importJudgementPairs(
        importJudgementPairsReq.judgementPairs,
      ),
    };
  }

  @Put('v1/config')
  @HttpCode(HttpStatus.NO_CONTENT)
  public async updateConfig(
    @Body(new ZodValidationPipe(updateConfigReqSchema.shape.request.shape.data))
    updateConfigReq: UpdateConfig['request']['data'],
  ) {
    await this.adminService.updateConfig(updateConfigReq);
  }

  @Get('v1/judgements/export/tsv')
  @ApiResponse({
    status: 200,
    content: {
      'text/tab-separated-values': {},
    },
  })
  public async exportJudgementsTsv(): Promise<ExportJudgements['response']> {
    return await this.judgementsService.exportJudgementsTsv();
  }

  @Get('v1/feedback/export/tsv')
  @ApiResponse({
    status: 200,
    content: {
      'text/tab-separated-values': {},
    },
  })
  public async exportFeedbackTsv(): Promise<ExportFeedback['response']> {
    return await this.feedbackService.exportFeedbackTsv();
  }

  @Get('v1/statistics')
  public async getStatistics(): Promise<LoadStatistics['response']> {
    return { statistics: await this.judgementsService.getStatistics() };
  }
}
