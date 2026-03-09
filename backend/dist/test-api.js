"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const dashboard_service_1 = require("./src/modules/dashboard/dashboard.service");
const transactions_service_1 = require("./src/modules/transactions/transactions.service");
const prisma = new client_1.PrismaClient();
const dash = new dashboard_service_1.DashboardService(prisma);
const tx = new transactions_service_1.TransactionsService(prisma);
async function run() {
    try {
        const user = await prisma.user.findFirst();
        if (!user)
            throw new Error("No user found");
        const dRes = await dash.getDashboardMetrics(user.householdId);
        console.log("DASH:", JSON.stringify(dRes).slice(0, 50));
        const tRes = await tx.findAll(user.householdId, undefined, undefined, undefined, 5, 0);
        console.log("TX:", JSON.stringify(tRes).slice(0, 50));
    }
    catch (err) {
        console.error("ERROR:", err);
    }
    finally {
        await prisma.$disconnect();
    }
}
run();
//# sourceMappingURL=test-api.js.map