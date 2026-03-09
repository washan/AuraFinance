import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ProjectsService } from './projects.service';

@Controller('projects')
@UseGuards(AuthGuard('jwt'))
export class ProjectsController {
    constructor(private readonly projectsService: ProjectsService) { }

    @Get()
    findAll(@Req() req: any) {
        return this.projectsService.findAll(req.user.householdId);
    }

    @Post()
    create(@Req() req: any, @Body() data: { name: string; description?: string }) {
        return this.projectsService.create(req.user.householdId, data);
    }

    @Patch(':id')
    update(@Req() req: any, @Param('id') id: string, @Body() data: { name?: string; description?: string }) {
        return this.projectsService.update(req.user.householdId, id, data);
    }

    @Delete(':id')
    remove(@Req() req: any, @Param('id') id: string) {
        return this.projectsService.remove(req.user.householdId, id);
    }
}
