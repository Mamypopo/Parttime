import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// สร้าง users
export const createUser = async (userData) => {
    const { password, ...otherData } = userData;
    // ตรวจสอบว่ามีรหัสผ่านหรือไม่
    if (!password) {
        throw new Error('Password is required');
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return prisma.user.create({
        data: {
            ...otherData,
            password: hashedPassword,
        },
    });
};

// เช็ค password
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


// อัพเดทข้อมูล user
export const updateUser = async (userId, userData) => {
    try {
        return await prisma.user.update({
            where: { id: userId },
            data: userData
        });
    } catch (error) {
        console.error('Error updating user:', error);
        throw error;
    }
};

// ฟังชั่นตรวจว่ามีอีเมลและเลขบัตรประชาชนในระบบหรือยัง
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



//ดึงประวัติงานทั้งหมดของ user
export const getUserJobHistory = (userId, limit = 10, offset = 0) =>
    prisma.jobParticipation.findMany({
        where: {
            user_id: parseInt(userId),
            // เงื่อนไขให้ดึงเฉพาะงานที่เสร็จสิ้นแล้ว
            status: 'approved',
            workHistories: {
                some: {} // มีประวัติการทำงาน
            }
        },
        select: {
            id: true,
            created_at: true,
            updated_at: true,
            user: {  // เพิ่มข้อมูลผู้ใช้
                select: {
                    id: true,
                    first_name: true,
                    last_name: true,
                    profile_image: true,
                    email: true
                }
            },
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

            workHistories: {
                select: {
                    rating: true,
                    comment: true,
                    created_at: true
                },
                orderBy: {
                    created_at: 'desc'
                },
                take: 1 // เอาเฉพาะการประเมินล่าสุด
            }
        },
        orderBy: {
            created_at: 'desc',
        },
        take: parseInt(limit),
        skip: parseInt(offset),
    });

// query ให้นับเฉพาะงานที่มีการประเมิน
export const getTotalJobHistoryCount = (userId) =>
    prisma.jobParticipation.count({
        where: {
            user_id: parseInt(userId),
            status: 'approved',
            workHistories: {
                some: {} // มีประวัติการทำงาน
            }
        },
    });


// สร้าง pending skill ใหม่
export const createPendingSkill = async (userId, skill) => {
    return prisma.pendingSkill.create({
        data: {
            userId,
            skill,
            status: 'pending'
        }
    });
};


export const updateUserOnlineStatus = async (userId) => {
    try {
        return await prisma.user.update({
            where: { id: userId },
            data: {
                last_active: new Date(),
                is_online: true
            }
        });
    } catch (error) {
        console.error('Error updating user online status:', error);
        throw new Error('ไม่สามารถอัพเดทสถานะออนไลน์ได้');
    }
};



export const updateUserOfflineStatus = async (userId) => {
    try {
        return await prisma.user.update({
            where: { id: userId },
            data: {
                is_online: false
            }
        });
    } catch (error) {
        console.error('Error updating user offline status:', error);
        throw new Error('ไม่สามารถอัพเดทสถานะออฟไลน์ได้');
    }
};






