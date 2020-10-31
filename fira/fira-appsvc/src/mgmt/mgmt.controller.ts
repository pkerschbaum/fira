import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import * as os from 'os';

import * as config from '../config';
import { basePaths, LoadHealth } from '../../../fira-commons/src/rest';

@ApiTags(basePaths.mgmt)
@Controller(basePaths.mgmt)
export class MgmtController {
  @Get('v1/health')
  public getHealth(): LoadHealth['response'] {
    const totalMB = Math.floor(os.totalmem() / 1024 / 1024);
    const freeMB = Math.floor(os.freemem() / 1024 / 1024);

    return {
      version: config.application.version,
      memory: { totalMB, freeMB },
    };
  }
}
