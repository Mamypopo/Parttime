import { PrismaClient } from '@prisma/client';
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
            age: userData.age, // ส่ง age ให้กับ Prisma
            education_level_url: userData.education_level_url,
            phone_number: userData.phone_number,
            line_id: userData.line_id,
            profile_image: userData.profile_image,
            skills: userData.skills, // ตรวจสอบว่า skills ถูกส่งไปถูกต้อง
            role: userData.role, // เพิ่ม role ในการบันทึกข้อมูลผู้ใช้
            verification_token: userData.verification_token, // บันทึก token ไว้ใน database
            email_verified: false // เริ่มต้นเป็น false
        }
    });
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
export const getUserById = async (id) => {
    return await prisma.user.findUnique({
        where: {
            id: parseInt(id),  // แปลงเป็น int
        },
    });
};

// ฟังก์ชันดึงผู้ใช้ตาม Email
export const getUserByEmail = async (email) => {
    return await prisma.user.findUnique({
        where: {
            email: email,
        },
    });
};

// ดึงข้อมูลผู้ใช้ทั้งหมด
export const getAllUsers = async () => {
    return await prisma.user.findMany();  // ดึงข้อมูลผู้ใช้ทั้งหมด
};