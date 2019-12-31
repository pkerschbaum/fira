import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { IdentityManagementService } from 'src/identity-management/identity-management.service';
import { LoginRequestDto, LoginResponseDto } from './dto/login.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly imService: IdentityManagementService) {}

  @Post('v1/login')
  @HttpCode(200)
  async login(
    @Body() loginRequest: LoginRequestDto,
  ): Promise<LoginResponseDto> {
    return this.imService.login(loginRequest.username, loginRequest.password);
  }
}
