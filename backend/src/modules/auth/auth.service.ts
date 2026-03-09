import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private prisma: PrismaService,
    ) { }

    private async seedHouseholdData(tx: any, householdId: string) {
        // Moneda por defecto
        await tx.currency.create({
            data: { code: 'USD', householdId, isLocalBase: true, isActive: true }
        });

        // Categorías por defecto
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

    async validateUser(email: string, pass: string): Promise<any> {
        const user = await this.usersService.findByEmail(email);
        if (user && await bcrypt.compare(pass, user.passwordHash || '')) {
            const { passwordHash, ...result } = user as any;
            return result;
        }
        return null;
    }

    async login(user: any) {
        const payload = { email: user.email, sub: user.id, householdId: user.householdId };

        let baseCurrencySymbol = '$';
        if (user.householdId) {
            const baseCurrency = await this.prisma.currency.findFirst({
                where: { householdId: user.householdId, isLocalBase: true }
            });
            if (baseCurrency) baseCurrencySymbol = baseCurrency.symbol;
        }

        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                householdId: user.householdId,
                baseCurrencySymbol,
            }
        };
    }

    async register(data: any) {
        // Check if user exists
        const existing = await this.usersService.findByEmail(data.email);
        if (existing) {
            throw new ConflictException('El correo electrónico ya está registrado');
        }

        const salt = await bcrypt.genSalt();
        const hash = await bcrypt.hash(data.password, salt);

        // Initial Registration requires creating a Household
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
                    role: 'ADMIN', // First user is Admin
                    passwordHash: hash,
                },
            });

            const { passwordHash, ...result } = user as any;
            return result;
        });
    }

    async googleLogin(req: any) {
        if (!req.user) {
            return 'No user from provider';
        }

        const payload = {
            email: req.user.email,
            sub: req.user.email // Simplificado: usamos el correo como base para cuentas Google en este MVP
        };

        // En un caso real:
        // 1. Buscamos al usuario en la BD usando el req.user.email
        let user = await this.usersService.findByEmail(req.user.email);

        // 2. Si no existe, lo creamos y le generamos un Household
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
                        passwordHash: '', // Usuarios de Google no tienen password
                    },
                });
            }) as any;
        }

        // Emitimos token
        const jwtPayload = {
            email: user!.email,
            sub: user!.id,
            householdId: user!.householdId
        };

        let baseCurrencySymbol = '$';
        if (user!.householdId) {
            const baseCurrency = await this.prisma.currency.findFirst({
                where: { householdId: user!.householdId, isLocalBase: true }
            });
            if (baseCurrency) baseCurrencySymbol = baseCurrency.symbol;
        }

        return {
            access_token: this.jwtService.sign(jwtPayload),
            user: { id: user!.id, email: user!.email, name: user!.name, householdId: user!.householdId, baseCurrencySymbol }
        };
    }
}
