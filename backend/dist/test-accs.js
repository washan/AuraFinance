"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const p = new client_1.PrismaClient();
async function run() {
    try {
        const acc = await p.account.findUnique({ where: { id: 'a51caf88-fb75-4c2b-bdc9-8da08bdd14c6' } });
        console.log("ACC BEFORE:", acc);
        await p.account.update({
            where: { id: 'a51caf88-fb75-4c2b-bdc9-8da08bdd14c6' },
            data: { balance: 1862684.90 }
        });
        const accAfter = await p.account.findUnique({ where: { id: 'a51caf88-fb75-4c2b-bdc9-8da08bdd14c6' } });
        console.log("ACC AFTER:", accAfter);
    }
    finally {
        await p.$disconnect();
    }
}
run();
//# sourceMappingURL=test-accs.js.map