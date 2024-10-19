import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();
// ฟังก์ชันสำหรับสร้างแอดมินใหม่
export const createAdmin = async (adminData) => {
    const { email, password, first_name, last_name } = adminData;
    const hashedPassword = await bcrypt.hash(password, 10);
    return prisma.admin.create({
        data: {
            email,
            password: hashedPassword,
            first_name,
            last_name,
        },
    });
};

export const verifyPassword = (password, hashedPassword) => bcrypt.compare(password, hashedPassword);


export const checkExistingAdmin = (email) =>
    prisma.admin.findUnique({ where: { email } });


export const findAdminById = async (adminId) => {
    return prisma.admin.findUnique({
        where: { id: adminId },
    });
};


export const findAllAdmins = () => prisma.admin.findMany();



export const findAdminByEmail = (email) =>
    prisma.admin.findUnique({ where: { email } });


export const approveUserById = (userId) =>
    prisma.user.update({
        where: { id: userId },
        data: { approved: true }
    });


export const updateUserApprovalStatus = (userId, isApproved) =>
    prisma.user.update({
        where: { id: userId },
        data: { approved: isApproved },
    });