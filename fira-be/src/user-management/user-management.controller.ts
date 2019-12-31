import {
  Controller,
  Post,
  Body,
  Headers,
  HttpException,
  UseGuards,
} from '@nestjs/common';

import { IdentityManagementService } from 'src/identity-management/identity-management.service';
import { Roles } from 'src/roles.decorator';
import { RolesGuard } from 'src/roles.guard';
import {
  ImportUsersRequestDto,
  ImportUsersResponseDto,
} from './dto/create-user.dto';

@Controller('user-management')
@Roles({ category: 'realm-management', role: 'manage-users' })
@UseGuards(RolesGuard)
export class UserManagementController {
  constructor(private readonly imService: IdentityManagementService) {}

  @Post('v1/import')
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
      importedUsers: await this.imService.importUsers(
        accessToken,
        importUsersRequest.users,
      ),
    };
  }
}
