import { PrismaService } from '../../../prisma/prisma.service';
import { BankConnection } from '@prisma/client';
import { ParserService } from './parser.service';
export declare class ImapService {
    private prisma;
    private parserService;
    private readonly logger;
    constructor(prisma: PrismaService, parserService: ParserService);
    syncAllActiveConnections(): Promise<void>;
    syncForConnection(connection: BankConnection): Promise<void>;
}
