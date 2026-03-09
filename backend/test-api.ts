import { PrismaClient } from '@prisma/client';
import { DashboardService } from './src/modules/dashboard/dashboard.service';
import { TransactionsService } from './src/modules/transactions/transactions.service';

const prisma = new PrismaClient();
const dash = new DashboardService(prisma as any);
const tx = new TransactionsService(prisma as any);

async function run() {
    try {
        const user = await prisma.user.findFirst();
        if (!user) throw new Error("No user found");
        const dRes = await dash.getDashboardMetrics(user.householdId);
        console.log("DASH:", JSON.stringify(dRes).slice(0, 50));

        // Test the exact method being called:
        const tRes = await tx.findAll(user.householdId, undefined, undefined, undefined, 5, 0);
        console.log("TX:", JSON.stringify(tRes).slice(0, 50));
    } catch (err) {
        console.error("ERROR:", err);
    } finally {
        await prisma.$disconnect();
    }
}
run();
