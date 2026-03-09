"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const p = new client_1.PrismaClient();
async function run() {
    try {
        const txs = await p.transaction.findMany({ include: { item: { include: { category: true } } } });
        const incomes = txs.filter(t => parseFloat(t.amountBase) > 0);
        console.log('--- INCOMES ---');
        incomes.forEach(i => console.log('ID:', i.id, 'Amt:', i.amountBase, 'AccID:', i.accountId));
    }
    finally {
        await p.$disconnect();
    }
}
run();
//# sourceMappingURL=test-inc.js.map