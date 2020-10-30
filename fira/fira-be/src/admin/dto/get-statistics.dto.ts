import { ValidateNested, IsString, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

import { StatisticsResp, Statistic } from '../../../../fira-commons';

export class StatisticsResponseDto implements StatisticsResp {
  @ValidateNested({ each: true })
  @Type(() => StatisticResponse)
  readonly statistics: StatisticResponse[];
}

export class StatisticResponse implements Statistic {
  @IsString()
  @IsNotEmpty()
  id: string;
  @IsString()
  @IsNotEmpty()
  label: string;
  @IsString()
  @IsNotEmpty()
  value: string;
}
