"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateInboxRuleDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_inbox_rule_dto_1 = require("./create-inbox-rule.dto");
class UpdateInboxRuleDto extends (0, mapped_types_1.PartialType)(create_inbox_rule_dto_1.CreateInboxRuleDto) {
}
exports.UpdateInboxRuleDto = UpdateInboxRuleDto;
//# sourceMappingURL=update-inbox-rule.dto.js.map