import { Controller, Get, Req, UseGuards, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
@UseGuards(AuthGuard('jwt'))
export class DashboardController {
    constructor(private dashboardService: DashboardService) { }

    @Get('summary')
    getSummary(@Req() req: any, @Query('projectId') projectId?: string, @Query('month') month?: string) {
        return this.dashboardService.getDashboardMetrics(req.user.householdId, projectId, month);
    }

    @Get('trend')
    getTrend(
        @Req() req: any,
        @Query('categoryId') categoryId?: string,
        @Query('months') months?: string,
    ) {
        return this.dashboardService.getTrendData(req.user.householdId, categoryId, months ? parseInt(months) : 6);
    }
}
