import { PrismaService } from '../../../prisma/prisma.service';
import { BankConnection } from '@prisma/client';
import { ParserService } from './parser.service';
import { WhatsAppService } from '../../whatsapp/whatsapp.service';
export declare class ImapService {
    private prisma;
    private parserService;
    private whatsappService;
    private readonly logger;
    constructor(prisma: PrismaService, parserService: ParserService, whatsappService: WhatsAppService);
    syncAllActiveConnections(): Promise<void>;
    syncForConnection(connection: BankConnection): Promise<void>;
}
