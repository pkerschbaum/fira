import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { ZodValidationPipe } from '../commons/zod-schema-validation.pipe';
import { IdentityManagementService } from '../identity-management/identity-management.service';
import {
  basePaths,
  Login,
  loginSchema,
  Refresh,
  refreshSchema,
} from '../../../fira-commons/src/rest-api';

@ApiTags(basePaths.auth)
@Controller(basePaths.auth)
export class AuthController {
  constructor(private readonly imService: IdentityManagementService) {}

  @Post(loginSchema.shape.request.shape.url._def.value)
  @HttpCode(200)
  public async login(
    @Body(new ZodValidationPipe(loginSchema.shape.request.shape.data))
    loginRequest: Login['request']['data'],
  ): Promise<Login['response']> {
    return this.imService.login(loginRequest.username, loginRequest.password);
  }

  @Post(refreshSchema.shape.request.shape.url._def.value)
  @HttpCode(200)
  public async refresh(
    @Body(new ZodValidationPipe(refreshSchema.shape.request.shape.data))
    refreshRequest: Refresh['request']['data'],
  ): Promise<Refresh['response']> {
    return this.imService.refresh(refreshRequest.refreshToken);
  }
}
