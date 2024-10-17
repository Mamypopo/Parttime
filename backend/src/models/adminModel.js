import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();
// ฟังก์ชันสำหรับสร้างแอดมินใหม่
export const createAdmin = async (adminData) => {
    const { email, password, first_name, last_name } = adminData;

    return await prisma.admin.create({
        data: {
            email,
            password,
            first_name,
            last_name,
        },
    });
};

export const verifyPassword = async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword);
};

// ฟังก์ชันสำหรับตรวจสอบว่ามีอีเมลซ้ำหรือไม่
export const checkExistingAdmin = async (email) => {
    return await prisma.admin.findUnique({
        where: { email: email },
    });
};

export const findAdminById = async (adminId) => {
    const admin = await prisma.admin.findUnique({
        where: {
            id: adminId, // ใช้ adminId ในการค้นหา
        },
    });

    if (!admin) {
        throw new Error('Admin not found');
    }

    return admin;
};

export const findAllAdmins = async () => {
    return prisma.admin.findMany();
};


export const findAdminByEmail = async (email) => {
    return await prisma.admin.findUnique({
        where: { email }
    });
};

export const approveUserById = async (userId) => {
    return await prisma.user.update({
        where: { id: userId },
        data: { approved: true }
    });
};

// ฟังก์ชันอัปเดตสถานะการอนุมัติของผู้ใช้
export const updateUserApprovalStatus = async (userId, isApproved) => {
    return prisma.user.update({
        where: { id: userId },
        data: { approved: isApproved },  // ใช้ isApproved ในการอัปเดตค่า true หรือ false
    });
};