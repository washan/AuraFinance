"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const users_service_1 = require("../users/users.service");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = __importStar(require("bcrypt"));
const prisma_service_1 = require("../../prisma/prisma.service");
let AuthService = class AuthService {
    usersService;
    jwtService;
    prisma;
    constructor(usersService, jwtService, prisma) {
        this.usersService = usersService;
        this.jwtService = jwtService;
        this.prisma = prisma;
    }
    async seedHouseholdData(tx, householdId) {
        await tx.currency.create({
            data: { code: 'USD', householdId, isLocalBase: true, isActive: true }
        });
        const catIngresos = await tx.category.create({ data: { householdId, name: 'Ingresos', icon: 'trending-up' } });
        await tx.item.createMany({
            data: [
                { categoryId: catIngresos.id, name: 'Salario' },
                { categoryId: catIngresos.id, name: 'Negocios' },
                { categoryId: catIngresos.id, name: 'Otros Ingresos' }
            ]
        });
        const catVivienda = await tx.category.create({ data: { householdId, name: 'Vivienda', icon: 'home' } });
        await tx.item.createMany({
            data: [
                { categoryId: catVivienda.id, name: 'Alquiler / Hipoteca' },
                { categoryId: catVivienda.id, name: 'Servicios (Agua, Luz, Int.)' },
            ]
        });
        const catComida = await tx.category.create({ data: { householdId, name: 'Alimentación', icon: 'coffee' } });
        await tx.item.createMany({
            data: [
                { categoryId: catComida.id, name: 'Supermercado' },
                { categoryId: catComida.id, name: 'Restaurantes' }
            ]
        });
        const catTransporte = await tx.category.create({ data: { householdId, name: 'Transporte', icon: 'car' } });
        await tx.item.createMany({
            data: [
                { categoryId: catTransporte.id, name: 'Combustible' },
                { categoryId: catTransporte.id, name: 'Transporte Público / Uber' },
            ]
        });
    }
    async validateUser(email, pass) {
        const user = await this.usersService.findByEmail(email);
        if (user && await bcrypt.compare(pass, user.passwordHash || '')) {
            const { passwordHash, ...result } = user;
            return result;
        }
        return null;
    }
    async login(user) {
        const payload = { email: user.email, sub: user.id, householdId: user.householdId };
        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                householdId: user.householdId,
            }
        };
    }
    async register(data) {
        const existing = await this.usersService.findByEmail(data.email);
        if (existing) {
            throw new common_1.ConflictException('El correo electrónico ya está registrado');
        }
        const salt = await bcrypt.genSalt();
        const hash = await bcrypt.hash(data.password, salt);
        return this.prisma.$transaction(async (tx) => {
            const household = await tx.household.create({
                data: { name: `Household of ${data.name}` },
            });
            await this.seedHouseholdData(tx, household.id);
            const user = await tx.user.create({
                data: {
                    email: data.email,
                    name: data.name,
                    householdId: household.id,
                    role: 'ADMIN',
                    passwordHash: hash,
                },
            });
            const { passwordHash, ...result } = user;
            return result;
        });
    }
    async googleLogin(req) {
        if (!req.user) {
            return 'No user from provider';
        }
        const payload = {
            email: req.user.email,
            sub: req.user.email
        };
        let user = await this.usersService.findByEmail(req.user.email);
        if (!user) {
            user = await this.prisma.$transaction(async (tx) => {
                const household = await tx.household.create({
                    data: { name: `Household of ${req.user.firstName || req.user.email}` },
                });
                await this.seedHouseholdData(tx, household.id);
                return tx.user.create({
                    data: {
                        email: req.user.email,
                        name: `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim() || req.user.email,
                        householdId: household.id,
                        role: 'ADMIN',
                        passwordHash: '',
                    },
                });
            });
        }
        const jwtPayload = {
            email: user.email,
            sub: user.id,
            householdId: user.householdId
        };
        return {
            access_token: this.jwtService.sign(jwtPayload),
            user: { id: user.id, email: user.email, name: user.name, householdId: user.householdId }
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        jwt_1.JwtService,
        prisma_service_1.PrismaService])
], AuthService);
//# sourceMappingURL=auth.service.js.map