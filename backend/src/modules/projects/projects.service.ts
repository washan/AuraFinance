import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ProjectsService {
    constructor(private prisma: PrismaService) { }

    async findAll(householdId: string) {
        return this.prisma.project.findMany({
            where: { householdId },
            orderBy: { name: 'asc' }
        });
    }

    async create(householdId: string, data: { name: string; description?: string }) {
        return this.prisma.project.create({
            data: {
                householdId,
                name: data.name,
                description: data.description
            }
        });
    }

    async update(householdId: string, id: string, data: { name?: string; description?: string }) {
        const project = await this.prisma.project.findFirst({
            where: { id, householdId }
        });

        if (!project) throw new NotFoundException('Project not found');

        return this.prisma.project.update({
            where: { id },
            data
        });
    }

    async remove(householdId: string, id: string) {
        const project = await this.prisma.project.findFirst({
            where: { id, householdId }
        });

        if (!project) throw new NotFoundException('Project not found');

        return this.prisma.project.delete({
            where: { id }
        });
    }
}
