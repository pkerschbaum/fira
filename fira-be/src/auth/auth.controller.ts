import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';

import { IdentityManagementService } from 'src/identity-management/identity-management.service';
import { LoginRequestDto, LoginResponseDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly imService: IdentityManagementService) {}

  @Post('v1/login')
  @ApiResponse({status: 200, type: LoginResponseDto})
  @HttpCode(200)
  async login(
    @Body() loginRequest: LoginRequestDto,
  ): Promise<LoginResponseDto> {
    return this.imService.login(loginRequest.username, loginRequest.password);
  }
}
