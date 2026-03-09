import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();

async function run() {
    try {
        const txs = await p.transaction.findMany({ include: { item: { include: { category: true } } } });
        const incomes = txs.filter(t => parseFloat(t.amountBase as any) > 0);
        console.log('--- INCOMES ---');
        incomes.forEach(i => console.log('ID:', i.id, 'Amt:', i.amountBase, 'AccID:', i.accountId));
    } finally {
        await p.$disconnect();
    }
}

run();
