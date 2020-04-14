import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import * as os from 'os';

import * as config from '../config';
import { HealthResponseDto } from './dto/health.dto';

@ApiTags('mgmt')
@Controller('mgmt')
export class MgmtController {
  @Get('v1/health')
  getHealth(): HealthResponseDto {
    const totalMB = Math.floor(os.totalmem() / 1024 / 1024);
    const freeMB = Math.floor(os.freemem() / 1024 / 1024);

    return {
      version: config.application.version,
      memory: { totalMB, freeMB },
    };
  }
}
