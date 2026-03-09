import { PartialType } from '@nestjs/mapped-types';
import { CreateInboxRuleDto } from './create-inbox-rule.dto';

export class UpdateInboxRuleDto extends PartialType(CreateInboxRuleDto) { }
