import { Controller, Body, Put, UseGuards, Get, HttpStatus, HttpCode } from '@nestjs/common';
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
  UpdateConfig,
  updateConfigReqSchema,
  ExportJudgements,
  exportJudgementsSchema,
  ExportFeedback,
  exportFeedbackSchema,
  LoadStatistics,
  loadStatisticsSchema,
} from '@fira-commons/src/rest-api';

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

  @Put(updateConfigReqSchema.shape.request.shape.url._def.value)
  @HttpCode(HttpStatus.NO_CONTENT)
  public async updateConfig(
    @Body(new ZodValidationPipe(updateConfigReqSchema.shape.request.shape.data))
    updateConfigReq: UpdateConfig['request']['data'],
  ) {
    await this.adminService.updateConfig(updateConfigReq);
  }

  @Get(exportJudgementsSchema.shape.request.shape.url._def.value)
  @ApiResponse({
    status: 200,
    content: {
      'text/tab-separated-values': {},
    },
  })
  public async exportJudgementsTsv(): Promise<ExportJudgements['response']> {
    return await this.judgementsService.exportJudgementsTsv();
  }

  @Get(exportFeedbackSchema.shape.request.shape.url._def.value)
  @ApiResponse({
    status: 200,
    content: {
      'text/tab-separated-values': {},
    },
  })
  public async exportFeedbackTsv(): Promise<ExportFeedback['response']> {
    return await this.feedbackService.exportFeedbackTsv();
  }

  @Get(loadStatisticsSchema.shape.request.shape.url._def.value)
  public async getStatistics(): Promise<LoadStatistics['response']> {
    return { statistics: await this.judgementsService.getStatistics() };
  }
}
