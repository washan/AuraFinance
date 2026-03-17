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
exports.AssetsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let AssetsService = class AssetsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(householdId, createAssetDto) {
        return this.prisma.asset.create({
            data: {
                ...createAssetDto,
                householdId,
            },
        });
    }
    async findAll(householdId) {
        return this.prisma.asset.findMany({
            where: { householdId, isActive: true },
            orderBy: [
                { category: 'asc' },
                { name: 'asc' },
            ],
        });
    }
    async findOne(id, householdId) {
        const asset = await this.prisma.asset.findFirst({
            where: { id, householdId },
        });
        if (!asset) {
            throw new common_1.NotFoundException(`Asset with ID ${id} not found`);
        }
        return asset;
    }
    async update(id, householdId, updateAssetDto) {
        await this.findOne(id, householdId);
        return this.prisma.asset.update({
            where: { id },
            data: updateAssetDto,
        });
    }
    async remove(id, householdId) {
        await this.findOne(id, householdId);
        return this.prisma.asset.update({
            where: { id },
            data: { isActive: false },
        });
    }
    async hardRemove(id, householdId) {
        await this.findOne(id, householdId);
        return this.prisma.asset.delete({
            where: { id },
        });
    }
};
exports.AssetsService = AssetsService;
exports.AssetsService = AssetsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AssetsService);
//# sourceMappingURL=assets.service.js.map