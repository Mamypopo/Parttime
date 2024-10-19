import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export const createUser = async (userData) => {
    const { password, ...otherData } = userData;
    const hashedPassword = await bcrypt.hash(password, 10);
    return prisma.user.create({
        data: {
            ...otherData,
            password: hashedPassword,
        },
    });
};

export const verifyPassword = (password, hashedPassword) =>
    bcrypt.compare(password, hashedPassword);


// ฟังก์ชันอัปเดตสถานะการยืนยันอีเมล
export const verifyUserEmail = (email) =>
    prisma.user.update({
        where: { email },
        data: {
            email_verified: true,
            verification_token: null
        },
    });

export const checkExistingUser = (email, national_id) =>
    prisma.user.findFirst({
        where: {
            OR: [
                { email },
                { national_id }
            ]
        }
    });

// ฟังก์ชันดึงผู้ใช้ตาม ID
export const getUserById = (userId, fields) =>
    prisma.user.findUnique({
        where: { id: parseInt(userId) },
        select: createSelectObject(fields)
    });

// ฟังก์ชันดึงผู้ใช้ตาม Email
export const getUserByEmail = (email, fields) =>
    prisma.user.findUnique({
        where: { email },
        select: createSelectObject(fields)
    });


// ดึงข้อมูลผู้ใช้ทั้งหมด
export const getAllUsers = (limit = 10, offset = 0, fields) =>
    prisma.user.findMany({
        take: parseInt(limit),
        skip: parseInt(offset),
        ...(createSelectObject(fields) && { select: createSelectObject(fields) })
    });


// ฟังก์ชันช่วยสร้าง select object
const createSelectObject = (fields) => {
    if (!fields) return null;
    const selectFields = fields.split(',').reduce((acc, field) => {
        acc[field.trim()] = true;
        return acc;
    }, {});
    return Object.keys(selectFields).length > 0 ? selectFields : null;
};



// ฟังก์ชันนับจำนวนผู้ใช้ทั้งหมด
export const getTotalUsersCount = () => prisma.user.count();


// ฟังก์ชันสำหรับดึงผู้ใช้ที่รอการอนุมัติ
export const findPendingUsers = () =>
    prisma.user.findMany({
        where: { approved: false },
    });


//ดึงประวัติงานทั้งหมดของ user
export const getUserJobHistory = (userId, limit = 10, offset = 0) =>
    prisma.jobParticipation.findMany({
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
                    job: {
                        select: {
                            title: true,
                            location: true,
                            work_date: true,
                        },
                    },
                },
            },
        },
        orderBy: {
            created_at: 'desc',
        },
        take: parseInt(limit),
        skip: parseInt(offset),
    });


export const getTotalJobHistoryCount = (userId) =>
    prisma.jobParticipation.count({
        where: {
            user_id: parseInt(userId),
        },
    });