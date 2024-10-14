import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
// ฟังก์ชันสำหรับสร้างแอดมินใหม่
export const createAdmin = async (adminData) => {
    const { email, password, first_name, last_name } = adminData;

    try {
        const newAdmin = await prisma.admin.create({
            data: {
                email,
                password,
                first_name,
                last_name,
            },
        });

        return newAdmin;
    } catch (error) {
        console.error("Error creating admin:", error.message);
        throw new Error("Unable to create admin.");
    }
};

// ฟังก์ชันสำหรับตรวจสอบว่ามีอีเมลซ้ำหรือไม่
export const checkExistingAdmin = async (email) => {
    try {
        const existingAdmin = await prisma.admin.findUnique({
            where: { email: email },
        });
        return existingAdmin;
    } catch (error) {
        console.error("Error checking existing admin:", error.message);
        throw new Error("Unable to check existing admin.");
    }
};
