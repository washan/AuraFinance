import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ParametersService } from '../parameters/parameters.service';
import { PrismaService } from '../../prisma/prisma.service';
export declare class WhatsAppService implements OnModuleInit, OnModuleDestroy {
    private parametersService;
    private prisma;
    private readonly logger;
    private client;
    private qrCodeDataUrl;
    private status;
    constructor(parametersService: ParametersService, prisma: PrismaService);
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    private initializeClient;
    getStatus(): {
        status: "INITIALIZING" | "QR_READY" | "CONNECTED" | "DISCONNECTED";
        qrCode: string | null;
    };
    sendMessageToConfiguredNumbers(userId: string, message: string): Promise<boolean>;
}
