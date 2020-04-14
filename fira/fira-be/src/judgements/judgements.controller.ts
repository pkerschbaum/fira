import {
  Controller,
  Post,
  Headers,
  UseGuards,
  Put,
  Param,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiHeader } from '@nestjs/swagger';

import { JudgementsService } from './judgements.service';
import { PreloadJudgementsResponseDto } from './dto/preload-judgements.dto';
import { AuthGuard } from '../auth.guard';
import { SaveJudgementRequestDto } from './dto/save-judgement.dto';
import { extractJwtPayload } from '../util/jwt.util';

@ApiTags('judgements')
@Controller('judgements')
@ApiHeader({
  name: 'authorization',
  required: true,
})
@UseGuards(AuthGuard)
export class JudgementsController {
  constructor(private readonly judgementsService: JudgementsService) {}

  @Post('v1/preload')
  async preloadJudgements(
    @Headers('authorization') authHeader: string,
  ): Promise<PreloadJudgementsResponseDto> {
    const jwtPayload = extractJwtPayload(authHeader);
    return await this.judgementsService.addPreloadWorklet(jwtPayload.preferred_username);
  }

  @Put('v1/:id')
  async saveJudgement(
    @Body() saveJudgementRequest: SaveJudgementRequestDto,
    @Param('id') judgementId: string,
    @Headers('authorization') authHeader: string,
  ): Promise<void> {
    const id: number = +judgementId;
    if (isNaN(id)) {
      throw new BadRequestException(
        `path parameter 'id' must be a number, but was: '${judgementId}'`,
      );
    }
    const jwtPayload = extractJwtPayload(authHeader);

    return await this.judgementsService.saveJudgement(
      jwtPayload.preferred_username,
      id,
      saveJudgementRequest,
    );
  }
}
