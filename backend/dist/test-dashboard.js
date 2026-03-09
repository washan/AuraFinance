"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const dashboard_service_1 = require("./src/modules/dashboard/dashboard.service");
const prisma = new client_1.PrismaClient();
const service = new dashboard_service_1.DashboardService(prisma);
async function run() {
    try {
        const user = await prisma.user.findFirst();
        if (!user)
            throw new Error("No user found");
        const res = await service.getDashboardMetrics(user.householdId);
        console.log("SUCCESS", res);
    }
    catch (err) {
        console.error("RUNTIME ERROR:", err);
    }
    finally {
        await prisma.$disconnect();
    }
}
run();
//# sourceMappingURL=test-dashboard.js.map