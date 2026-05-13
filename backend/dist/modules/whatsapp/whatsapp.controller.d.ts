import { WhatsAppService } from './whatsapp.service';
export declare class WhatsAppController {
    private readonly whatsappService;
    constructor(whatsappService: WhatsAppService);
    getStatus(): {
        status: "INITIALIZING" | "QR_READY" | "CONNECTED" | "DISCONNECTED";
        qrCode: string | null;
    };
}
