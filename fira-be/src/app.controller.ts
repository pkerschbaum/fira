import { Controller, Get, HttpService, Inject } from '@nestjs/common';
import * as identityMgmtService from './identity-management/identity-management.service';
import { IdentityManagementService } from './identity-management/identity-management.service';

@Controller()
export class AppController {
  constructor(
    @Inject(identityMgmtService.SERVICE_TOKEN)
    private readonly imService: IdentityManagementService,
  ) {}

  @Get()
  async getHello(): Promise<string> {
    return this.imService.loadPublicKey();
  }
}
