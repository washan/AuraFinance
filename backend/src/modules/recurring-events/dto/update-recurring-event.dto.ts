import { PartialType } from '@nestjs/mapped-types';
import { CreateRecurringEventDto } from './create-recurring-event.dto';
import { IsOptional, IsBoolean } from 'class-validator';

export class UpdateRecurringEventDto extends PartialType(CreateRecurringEventDto) {
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}
