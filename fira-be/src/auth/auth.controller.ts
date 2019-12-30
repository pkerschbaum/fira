import { Controller, Get } from '@nestjs/common';

import { IdentityManagementService } from 'src/identity-management/identity-management.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly imService: IdentityManagementService) {}

  @Get()
  async getPublicKey(): Promise<{ publicKey: string }> {
    const publicKey = await this.imService.loadPublicKey();
    return {
      publicKey,
    };
  }
}
