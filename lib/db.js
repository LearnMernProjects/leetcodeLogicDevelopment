import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
  return new PrismaClient();
};

const prisma = globalThis.prisma ?? prismaClientSingleton();

export const db = prisma;

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma;
