import { IsDefined, IsString, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class HealthResponseDto {
  @IsString()
  @IsDefined()
  readonly version: string;
  readonly memory: MemoryResponseDto;
}

export class MemoryResponseDto {
  @IsNumber()
  @IsDefined()
  readonly totalMB: number;
  @IsNumber()
  @IsDefined()
  readonly freeMB: number;
}
