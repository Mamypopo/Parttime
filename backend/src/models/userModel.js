import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export const createUser = async (userData) => {
    return await prisma.user.create({
        data: {
            email: userData.email,
            password: userData.password,
            prefix: userData.prefix,
            first_name: userData.first_name,
            last_name: userData.last_name,
            national_id: userData.national_id,
            gender: userData.gender,
            birth_date: userData.birth_date,
            age: userData.age,
            education_level_url: userData.education_level_url,
            phone_number: userData.phone_number,
            line_id: userData.line_id,
            profile_image: userData.profile_image,
            skills: userData.skills,
            role: userData.role,
            verification_token: userData.verification_token,
            email_verified: false
        }
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

// ฟังก์ชันตรวจสอบว่ามีผู้ใช้ที่ใช้อีเมลหรือเลขบัตรประชาชนนี้อยู่แล้วหรือไม่
export const checkExistingUser = async (email, national_id) => {
    return await prisma.user.findFirst({
        where: {
            OR: [
                { email: email },            // ตรวจสอบว่าอีเมลซ้ำหรือไม่
                { national_id: national_id }  // ตรวจสอบว่าเลขบัตรประชาชนซ้ำหรือไม่
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