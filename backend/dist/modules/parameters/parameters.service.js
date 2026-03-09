"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParametersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let ParametersService = class ParametersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getParameter(userId, code) {
        const parameter = await this.prisma.parameter.findUnique({
            where: {
                code_userId: {
                    code,
                    userId,
                },
            },
        });
        if (!parameter) {
            throw new common_1.NotFoundException(`Parameter ${code} not found`);
        }
        return parameter;
    }
    async upsertParameter(userId, code, value, description) {
        return this.prisma.parameter.upsert({
            where: {
                code_userId: {
                    code,
                    userId,
                },
            },
            update: {
                value,
                ...(description && { description }),
            },
            create: {
                userId,
                code,
                value,
                description,
            },
        });
    }
    async getAllParameters(userId) {
        return this.prisma.parameter.findMany({
            where: { userId },
        });
    }
};
exports.ParametersService = ParametersService;
exports.ParametersService = ParametersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ParametersService);
//# sourceMappingURL=parameters.service.js.map