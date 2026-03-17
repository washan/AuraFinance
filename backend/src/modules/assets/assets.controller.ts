import { Controller, Get, Post, Body, Patch, Param, Delete, Request, UseGuards } from '@nestjs/common';
import { AssetsService } from './assets.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('assets')
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Post()
  create(@Request() req: any, @Body() createAssetDto: CreateAssetDto) {
    return this.assetsService.create(req.user.householdId, createAssetDto);
  }

  @Get()
  findAll(@Request() req: any) {
    return this.assetsService.findAll(req.user.householdId);
  }

  @Get(':id')
  findOne(@Request() req: any, @Param('id') id: string) {
    return this.assetsService.findOne(id, req.user.householdId);
  }

  @Patch(':id')
  update(@Request() req: any, @Param('id') id: string, @Body() updateAssetDto: UpdateAssetDto) {
    return this.assetsService.update(id, req.user.householdId, updateAssetDto);
  }

  @Delete(':id')
  remove(@Request() req: any, @Param('id') id: string) {
    return this.assetsService.remove(id, req.user.householdId);
  }
}
