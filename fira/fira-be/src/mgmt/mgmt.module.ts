import { Module } from '@nestjs/common';

import { MgmtController } from './mgmt.controller';

@Module({
  controllers: [MgmtController],
})
export class MgmtModule {}
