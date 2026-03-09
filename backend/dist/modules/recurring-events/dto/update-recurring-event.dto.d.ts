import { CreateRecurringEventDto } from './create-recurring-event.dto';
declare const UpdateRecurringEventDto_base: import("@nestjs/mapped-types").MappedType<Partial<CreateRecurringEventDto>>;
export declare class UpdateRecurringEventDto extends UpdateRecurringEventDto_base {
    isActive?: boolean;
}
export {};
