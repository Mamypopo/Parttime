import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export const createUser = async (userData) => {
    return await prisma.user.create({
        data: userData
    });
};
// ฟังก์ชันอัปเดตสถานะการยืนยันอีเมล
export const verifyUserEmail = async (email) => {
    return prisma.user.update({
        where: { email: email },
        data: {
            email_verified: true,
            verification_token: null // ลบ token หลังยืนยัน
        },
    });
};


export const verifyPassword = async (inputPassword, storedHashedPassword) => {
    return bcrypt.compare(inputPassword, storedHashedPassword);
};

export const checkExistingUser = async (email, national_id) => {
    return await prisma.user.findFirst({
        where: {
            OR: [
                { email: email },
                { national_id: national_id }
            ]
        }
    });
};
// ฟังก์ชันดึงผู้ใช้ตาม ID
export const getUserById = async (userId) => {
    return prisma.user.findUnique({
        where: { id: parseInt(userId) },
    });
};
// ฟังก์ชันดึงผู้ใช้ตาม Email
export const getUserByEmail = async (email) => {
    return prisma.user.findUnique({
        where: { email },
    });
};

// ดึงข้อมูลผู้ใช้ทั้งหมด
export const getAllUsers = async () => {
    return await prisma.user.findMany();  // ดึงข้อมูลผู้ใช้ทั้งหมด
};

// ฟังก์ชันสำหรับดึงผู้ใช้ที่รอการอนุมัติ
export const findPendingUsers = async () => {
    return await prisma.user.findMany({
        where: { approved: false },
    });
};
//ดึงประวัติงานทั้งหมดของ user
export const getUserJobHistory = async (userId) => {
    return prisma.jobParticipation.findMany({
        where: {
            user_id: parseInt(userId),
        },
        select: {
            status: true,
            created_at: true,
            updated_at: true,
            jobPosition: {
                select: {
                    position_name: true,
                    wage: true,
                    job: { // ดึงข้อมูลงานผ่าน jobPosition
                        select: {
                            title: true,
                            location: true,
                            work_date: true,
                        },
                    },
                },
            },
        },
    });
};


