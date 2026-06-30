const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.budget.count().then(console.log).finally(() => prisma.$disconnect());
