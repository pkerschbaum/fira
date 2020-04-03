import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { IdentityManagementService } from 'src/identity-management/identity-management.service';
import { LoginRequestDto, LoginResponseDto } from './dto/login.dto';
import { RefreshRequestDto, RefreshResponseDto } from './dto/refresh.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly imService: IdentityManagementService) {}

  @Post('v1/login')
  @HttpCode(200)
  async login(@Body() loginRequest: LoginRequestDto): Promise<LoginResponseDto> {
    return this.imService.login(loginRequest.username, loginRequest.password);
  }

  @Post('v1/refresh')
  @HttpCode(200)
  async refresh(@Body() refreshRequest: RefreshRequestDto): Promise<RefreshResponseDto> {
    return this.imService.refresh(refreshRequest.refreshToken);
  }
}
