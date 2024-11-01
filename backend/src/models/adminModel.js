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

export const getAdminById = async (id) => {
    console.log('Getting admin with ID:', id); // เพิ่ม log

    if (!id) {
        throw new Error('Admin ID is required');
    }

    const adminId = parseInt(id);
    if (isNaN(adminId)) {
        throw new Error('Invalid admin ID format');
    }

    const admin = await prisma.admin.findUnique({
        where: {
            id: adminId
        }
    });

    console.log('Found admin:', admin); // เพิ่ม log
    return admin;
};

export const findAllAdmins = () => prisma.admin.findMany();



export const findAdminByEmail = (email) =>
    prisma.admin.findUnique({ where: { email } });


// ฟังก์ชันสำหรับดึงผู้ใช้ที่รอการอนุมัติ
export const findPendingUsers = (page = 1, perPage = 10) =>
    prisma.user.findMany({
        where: { approved: false },
        select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
            email_verified: true,
            created_at: true,
            skills: true,
            // ข้อมูลพื้นฐาน
            prefix: true,
            gender: true,
            birth_date: true,
            age: true,
            phone_number: true,
            national_id: true,
            line_id: true,
            profile_image: true,
            // เอกสาร
            education_certificate: true,
            user_documents: true
        },
        skip: (page - 1) * perPage,
        take: perPage,
        orderBy: {
            created_at: 'desc'
        }
    });



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



// สำหรับแอดมิน - ดึงข้อมูล pending skills ทั้งหมดพร้อมข้อมูลผู้ใช้
export const getAllPendingSkillsForAdmin = async () => {
    return prisma.pendingSkill.findMany({
        where: {
            status: 'pending'
        },
        include: {
            user: {
                select: {
                    id: true,
                    first_name: true,
                    last_name: true,
                    email: true
                }
            }
        },
        orderBy: {
            created_at: 'desc'
        }
    });
};



// ดึงข้อมูล pending skill ตาม id
export const getPendingSkillById = async (id) => {

    return prisma.pendingSkill.findUnique({
        where: {
            id: parseInt(id)
        },
        include: {
            user: true
        }
    });
};

// อัปเดตสถานะ pending skill
export const updatePendingSkillStatus = async (id, status) => {
    return prisma.pendingSkill.update({
        where: {
            id: parseInt(id)
        },
        data: { status },
        include: {
            user: true
        }
    });
};


// อัปเดต user skills
export const updateUserSkills = async (userId, skills) => {
    return prisma.user.update({
        where: {
            id: parseInt(userId)
        },
        data: { skills }
    });
};


export const checkWeeklySkillRequest = async (userId) => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const recentRequest = await prisma.pendingSkill.findFirst({
        where: {
            userId: userId,
            created_at: {
                gte: oneWeekAgo
            }
        },
        select: {
            id: true,
            skill: true,
            status: true,
            created_at: true  // ต้องแน่ใจว่ามีการเลือก createdAt
        },
        orderBy: {
            created_at: 'desc'
        }
    });

    return recentRequest;
};
