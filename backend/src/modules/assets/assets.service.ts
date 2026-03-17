import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';

@Injectable()
export class AssetsService {
  constructor(private prisma: PrismaService) {}

  async create(householdId: string, createAssetDto: CreateAssetDto) {
    return this.prisma.asset.create({
      data: {
        ...createAssetDto,
        householdId,
      },
    });
  }

  async findAll(householdId: string) {
    return this.prisma.asset.findMany({
      where: { householdId, isActive: true },
      orderBy: [
        { category: 'asc' },
        { name: 'asc' },
      ],
    });
  }

  async findOne(id: string, householdId: string) {
    const asset = await this.prisma.asset.findFirst({
      where: { id, householdId },
    });

    if (!asset) {
      throw new NotFoundException(`Asset with ID ${id} not found`);
    }

    return asset;
  }

  async update(id: string, householdId: string, updateAssetDto: UpdateAssetDto) {
    await this.findOne(id, householdId);

    return this.prisma.asset.update({
      where: { id },
      data: updateAssetDto,
    });
  }

  async remove(id: string, householdId: string) {
    await this.findOne(id, householdId);

    return this.prisma.asset.update({
      where: { id },
      data: { isActive: false },
    });
  }

  // Hard delete if necessary
  async hardRemove(id: string, householdId: string) {
    await this.findOne(id, householdId);

    return this.prisma.asset.delete({
      where: { id },
    });
  }
}
