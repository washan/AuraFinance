import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();

async function run() {
    try {
        const acc = await p.account.findUnique({ where: { id: 'a51caf88-fb75-4c2b-bdc9-8da08bdd14c6' } });
        console.log("ACC BEFORE:", acc);

        // We know there are exactly two 931342.45 Income items connected to this account.
        // That means the account should total 1862684.90 (since it currently sits at 0 locally).
        await p.account.update({
            where: { id: 'a51caf88-fb75-4c2b-bdc9-8da08bdd14c6' },
            data: { balance: 1862684.90 }
        });

        const accAfter = await p.account.findUnique({ where: { id: 'a51caf88-fb75-4c2b-bdc9-8da08bdd14c6' } });
        console.log("ACC AFTER:", accAfter);
    } finally {
        await p.$disconnect();
    }
}

run();
