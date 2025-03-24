import prisma from '../config/prisma.js';
import bcrypt from 'bcrypt';

// สร้าง users
export const createUser = async (userData) => {
    const { password, ...otherData } = userData;
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
            workHistories: {
                some: {}
            }
        },
        select: {
            id: true,
            created_at: true,
            updated_at: true,
            status: true,
            user: {
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
                    id: true,
                    appearance_score: true,
                    quality_score: true,
                    quantity_score: true,
                    manner_score: true,
                    punctuality_score: true,
                    total_score: true,
                    comment: true,
                    is_passed_evaluation: true,
                    created_at: true
                },
                orderBy: {
                    created_at: 'desc'
                }
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
            workHistories: {
                some: {}
            }
        },
    });


// ฟังก์ชันสำหรับอัพเดท reset token
export const updateResetToken = async (email, resetToken, resetTokenExpiry) => {
    try {
        return await prisma.user.update({
            where: { email },
            data: {
                reset_password_token: resetToken,
                reset_token_expires: resetTokenExpiry
            }
        });
    } catch (error) {
        console.error('Error updating reset token:', error);
        throw new Error('ไม่สามารถอัพเดทโทเค็นรีเซ็ตรหัสผ่านได้');
    }
};


// ฟังก์ชันสำหรับค้นหา user จาก reset token
export const findUserByResetToken = async (token) => {
    try {
        return await prisma.user.findFirst({
            where: {
                reset_password_token: token,
                reset_token_expires: {
                    gt: new Date()
                }
            }
        });
    } catch (error) {
        console.error('Error finding user by reset token:', error);
        throw new Error('ไม่สามารถค้นหาผู้ใช้จากโทเค็นได้');
    }
};

// ฟังก์ชันสำหรับรีเซ็ตรหัสผ่าน
export const resetUserPassword = async (userId, hashedPassword) => {
    try {
        return await prisma.user.update({
            where: { id: userId },
            data: {
                password: hashedPassword,
                reset_password_token: null,
                reset_token_expires: null
            }
        });
    } catch (error) {
        console.error('Error resetting password:', error);
        throw new Error('ไม่สามารถรีเซ็ตรหัสผ่านได้');
    }
};

export const findUserById = async (userId) => {
    try {
        const user = await prisma.user.findUnique({
            where: {
                id: parseInt(userId)
            },
            select: {
                id: true,
                first_name: true,
                last_name: true,
                email: true,
                role: true,
                phone_number: true,
                profile_image: true,
                skills: true
            }
        });
        return user;
    } catch (error) {
        console.error('Error finding user by ID:', error);
        throw error;
    }
};


