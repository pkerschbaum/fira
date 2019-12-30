import { Controller, Inject, Get } from '@nestjs/common';

import * as identityMgmtService from '../identity-management/identity-management.service';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject(identityMgmtService.SERVICE_TOKEN)
    private readonly imService: identityMgmtService.IdentityManagementService,
  ) {}

  @Get()
  async getPublicKey(): Promise<{ publicKey: string }> {
    const publicKey = await this.imService.loadPublicKey();
    return {
      publicKey,
    };
  }
}
