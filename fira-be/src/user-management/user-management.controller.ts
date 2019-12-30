import { Controller, Post, Body, Headers, HttpException } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';

import { IdentityManagementService } from 'src/identity-management/identity-management.service';
import {
  ImportUsersRequestDto,
  ImportUsersResponseDto,
} from './dto/create-user.dto';

@Controller('user-management')
export class UserManagementController {
  constructor(private readonly imService: IdentityManagementService) {}

  @Post('v1/import')
  @ApiResponse({ status: 201, type: ImportUsersResponseDto })
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
