import { PrismaClient } from '@prisma/client';
import { DashboardService } from './src/modules/dashboard/dashboard.service';

const prisma = new PrismaClient();
const service = new DashboardService(prisma as any);

async function run() {
    try {
        const user = await prisma.user.findFirst();
        if (!user) throw new Error("No user found");
        const res = await service.getDashboardMetrics(user.householdId);
        console.log("SUCCESS", res);
    } catch (err) {
        console.error("RUNTIME ERROR:", err);
    } finally {
        await prisma.$disconnect();
    }
}
run();
