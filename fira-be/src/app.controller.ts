import { Controller, Get, HttpService, Inject } from '@nestjs/common';
import { AppService } from './app.service';
import { imServiceFactory, IdentityManagementService } from './identity-management/identity-management.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService,  @Inject(imServiceFactory) private readonly imService: IdentityManagementService) {}

  @Get()
  async getHello(): Promise<string> {
    return this.imService.loadPublicKey();
  }
}
