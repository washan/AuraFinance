import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ParametersService {
    constructor(private prisma: PrismaService) { }

    async getParameter(userId: string, code: string) {
        const parameter = await this.prisma.parameter.findUnique({
            where: {
                code_userId: {
                    code,
                    userId,
                },
            },
        });

        if (!parameter) {
            throw new NotFoundException(`Parameter ${code} not found`);
        }

        return parameter;
    }

    async upsertParameter(userId: string, code: string, value: string, description?: string) {
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

    async getAllParameters(userId: string) {
        return this.prisma.parameter.findMany({
            where: { userId },
        });
    }
}
