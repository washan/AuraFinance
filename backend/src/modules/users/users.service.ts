import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { User, Prisma } from '@prisma/client';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    async findByEmail(email: string): Promise<User | null> {
        return this.prisma.user.findUnique({
            where: { email },
        });
    }

    async create(data: Prisma.UserCreateInput): Promise<User> {
        return this.prisma.user.create({
            data,
        });
    }

    async getHouseholdMembers(householdId: string): Promise<any[]> {
        return this.prisma.user.findMany({
            where: { householdId },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
            }
        });
    }

    async addHouseholdMember(adminUserId: string, householdId: string, email: string, name: string): Promise<void> {
        // Validate admin
        const admin = await this.prisma.user.findUnique({ where: { id: adminUserId } });
        if (!admin || admin.householdId !== householdId || admin.role !== 'ADMIN') {
            throw new Error('Only household admins can add new members.');
        }

        const existingUser = await this.findByEmail(email);

        if (existingUser) {
            // User already exists in the system (e.g. they logged in with Google earlier)
            // Just move them to this household.
            await this.prisma.user.update({
                where: { id: existingUser.id },
                data: {
                    householdId: householdId,
                    role: 'MEMBER'
                }
            });
        } else {
            // User does not exist, pre-create the record so they can login later
            await this.prisma.user.create({
                data: {
                    email,
                    name,
                    householdId,
                    role: 'MEMBER',
                    passwordHash: '', // They will login via Google
                }
            });
        }
    }
}
