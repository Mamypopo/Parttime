import prisma from '../config/prisma.js';
import bcrypt from 'bcrypt';

export const createAdmin = async (adminData) => {
    const { email, password, first_name, last_name, phone, profile_pic } = adminData;
    const hashedPassword = await bcrypt.hash(password, 10);
    return prisma.admin.create({
        data: {
            email,
            password: hashedPassword,
            first_name,
            last_name,
            phone,
            profile_pic
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

    // console.log('Found admin:', admin); 
    return admin;
};

export const findAllAdmins = () => prisma.admin.findMany();


export const findAdminByEmail = (email) =>
    prisma.admin.findUnique({ where: { email } });

// ฟังก์ชันพื้นฐานสำหรับดึงข้อมูลผู้ใช้
const baseUserSelect = {
    id: true,
    first_name: true,
    last_name: true,
    email: true,
    created_at: true,
    updated_at: true,
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
    user_documents: true,
    approved: true
};


// ดึงผู้ใช้ที่รอการอนุมัติ
export const findPendingUsers = (limit = 10, offset = 0, searchParams = {}) => {
    const whereClause = {
        approved: "pending"
    }

    // เงื่อนไขการค้นหา
    if (searchParams.userId) {
        whereClause.id = parseInt(searchParams.userId)
    }

    if (searchParams.idCard) {
        whereClause.national_id = {
            contains: searchParams.idCard,
            mode: 'insensitive'
        }
    }

    if (searchParams.name) {
        const searchTerms = searchParams.name.trim().split(/\s+/)

        if (searchTerms.length > 1) {
            whereClause.AND = [
                {
                    first_name: {
                        contains: searchTerms[0],
                        mode: 'insensitive'
                    }
                },
                {
                    last_name: {
                        contains: searchTerms[1],
                        mode: 'insensitive'
                    }
                }
            ]
        } else {
            whereClause.OR = [
                {
                    first_name: {
                        contains: searchTerms[0],
                        mode: 'insensitive'
                    }
                },
                {
                    last_name: {
                        contains: searchTerms[0],
                        mode: 'insensitive'
                    }
                }
            ]
        }
    }

    return prisma.user.findMany({
        where: whereClause,
        select: baseUserSelect,
        take: parseInt(limit),
        skip: parseInt(offset),
        orderBy: { created_at: 'desc' }
    });
}

export const countUsersPending = async (searchParams = {}) => {
    try {
        const whereClause = {
            approved: "pending"
        }

        if (searchParams.userId) {
            whereClause.id = parseInt(searchParams.userId)
        }

        if (searchParams.idCard) {
            whereClause.national_id = {
                contains: searchParams.idCard,
                mode: 'insensitive'
            }
        }

        if (searchParams.name) {
            const searchTerms = searchParams.name.trim().split(/\s+/)

            if (searchTerms.length > 1) {
                whereClause.AND = [
                    {
                        first_name: {
                            contains: searchTerms[0],
                            mode: 'insensitive'
                        }
                    },
                    {
                        last_name: {
                            contains: searchTerms[1],
                            mode: 'insensitive'
                        }
                    }
                ]
            } else {
                whereClause.OR = [
                    {
                        first_name: {
                            contains: searchTerms[0],
                            mode: 'insensitive'
                        }
                    },
                    {
                        last_name: {
                            contains: searchTerms[0],
                            mode: 'insensitive'
                        }
                    }
                ]
            }
        }

        const totalCount = await prisma.user.count({
            where: whereClause
        });

        return {
            total: totalCount
        };

    } catch (error) {
        console.error('Error in countUsersPending:', error);
        throw error;
    }
}



// ดึงผู้ใช้ที่อนุมัติแล้ว
export const findApprovedUsers = (limit = 10, offset = 0, searchParams = {}) => {
    const whereClause = {
        approved: "approved"
    }

    // เงื่อนไขการค้นหา
    if (searchParams.userId) {
        whereClause.id = parseInt(searchParams.userId)
    }
    if (searchParams.idCard) {
        whereClause.national_id = {
            contains: searchParams.idCard,
            mode: 'insensitive'
        }
    }

    // ค้นหาชื่อ-นามสกุล
    if (searchParams.name) {
        // แยกคำค้นหาด้วย space
        const searchTerms = searchParams.name.trim().split(/\s+/)

        if (searchTerms.length > 1) {
            // ถ้ามีการเว้นวรรค จะค้นหาทั้งชื่อและนามสกุล
            whereClause.AND = [
                {
                    first_name: {
                        contains: searchTerms[0],
                        mode: 'insensitive'
                    }
                },
                {
                    last_name: {
                        contains: searchTerms[1],
                        mode: 'insensitive'
                    }
                }
            ]
        } else {
            // ถ้ามีคำเดียว จะค้นหาในชื่อหรือนามสกุล
            whereClause.OR = [
                {
                    first_name: {
                        contains: searchTerms[0],
                        mode: 'insensitive'
                    }
                },
                {
                    last_name: {
                        contains: searchTerms[0],
                        mode: 'insensitive'
                    }
                }
            ]
        }
    }

    return prisma.user.findMany({
        where: whereClause,
        select: baseUserSelect,
        take: parseInt(limit),
        skip: parseInt(offset),
        orderBy: { created_at: 'desc' }
    });
}

export const countUsersApproved = (searchParams = {}) => {
    const whereClause = {
        approved: "approved"
    }
    if (searchParams.userId) {
        whereClause.id = parseInt(searchParams.userId)
    }

    if (searchParams.idCard) {
        whereClause.national_id = {
            contains: searchParams.idCard
        }
    }

    if (searchParams.name) {
        const searchTerms = searchParams.name.trim().split(/\s+/)

        if (searchTerms.length > 1) {
            whereClause.AND = [
                {
                    first_name: {
                        contains: searchTerms[0],
                        mode: 'insensitive'
                    }
                },
                {
                    last_name: {
                        contains: searchTerms[1],
                        mode: 'insensitive'
                    }
                }
            ]
        } else {
            whereClause.OR = [
                {
                    first_name: {
                        contains: searchTerms[0],
                        mode: 'insensitive'
                    }
                },
                {
                    last_name: {
                        contains: searchTerms[0],
                        mode: 'insensitive'
                    }
                }
            ]
        }
    }

    return prisma.user.count({
        where: whereClause
    });
}

// ดึงผู้ใช้ที่ถูกปฏิเสธ
export const findRejectedUsers = (limit = 10, offset = 0, searchParams = {}) => {
    const whereClause = {
        approved: "rejected"
    }

    if (searchParams.userId) {
        whereClause.id = parseInt(searchParams.userId)
    }

    if (searchParams.idCard) {
        whereClause.national_id = {
            contains: searchParams.idCard,
            mode: 'insensitive'
        }
    }

    if (searchParams.name) {
        const searchTerms = searchParams.name.trim().split(/\s+/)

        if (searchTerms.length > 1) {
            whereClause.AND = [
                {
                    first_name: {
                        contains: searchTerms[0],
                        mode: 'insensitive'
                    }
                },
                {
                    last_name: {
                        contains: searchTerms[1],
                        mode: 'insensitive'
                    }
                }
            ]
        } else {
            whereClause.OR = [
                {
                    first_name: {
                        contains: searchTerms[0],
                        mode: 'insensitive'
                    }
                },
                {
                    last_name: {
                        contains: searchTerms[0],
                        mode: 'insensitive'
                    }
                }
            ]
        }
    }

    return prisma.user.findMany({
        where: whereClause,
        select: {
            ...baseUserSelect,
            JobParticipation: {
                include: {
                    workHistories: {
                        select: {
                            id: true,
                            is_passed_evaluation: true,
                            appearance_score: true,
                            quality_score: true,
                            quantity_score: true,
                            manner_score: true,
                            punctuality_score: true,
                            total_score: true,
                            comment: true,
                            created_at: true
                        }
                    },
                    jobPosition: {
                        include: {
                            job: true
                        }
                    }
                }
            }
        },
        take: parseInt(limit),
        skip: parseInt(offset),
        orderBy: { created_at: 'desc' }
    });
}


export const countUsersRejected = async (searchParams = {}) => {
    const whereClause = {
        approved: "rejected"
    }

    if (searchParams.userId) {
        whereClause.id = parseInt(searchParams.userId)
    }

    if (searchParams.idCard) {
        whereClause.national_id = {
            contains: searchParams.idCard,
            mode: 'insensitive'
        }
    }

    if (searchParams.name) {
        const searchTerms = searchParams.name.trim().split(/\s+/)

        if (searchTerms.length > 1) {
            whereClause.AND = [
                {
                    first_name: {
                        contains: searchTerms[0],
                        mode: 'insensitive'
                    }
                },
                {
                    last_name: {
                        contains: searchTerms[1],
                        mode: 'insensitive'
                    }
                }
            ]
        } else {
            whereClause.OR = [
                {
                    first_name: {
                        contains: searchTerms[0],
                        mode: 'insensitive'
                    }
                },
                {
                    last_name: {
                        contains: searchTerms[0],
                        mode: 'insensitive'
                    }
                }
            ]
        }
    }

    const totalCount = await prisma.user.count({
        where: whereClause
    });
    return {
        total: totalCount
    };
}

// นับจำนวนผู้ใช้แต่ละสถานะ
export const countUsersByStatus = () =>
    prisma.user.groupBy({
        by: ['approved'],
        _count: true
    });


// อัพเดทอนุมัติการใช้งาน users
export const updateUserApprovalStatus = (userId, status) =>
    prisma.user.update({
        where: { id: userId },
        data: { approved: status },
    });


// ฟังก์ชันสำหรับ reject user จากการประเมินงาน
export const rejectUserFromWorkEvaluation = async (userId) => {
    try {
        return await prisma.user.update({
            where: {
                id: userId
            },
            data: {
                approved: 'rejected',
                updated_at: new Date()
            }
        });
    } catch (error) {
        console.error('Error rejecting user:', error);
        throw error;
    }
};


// ดึงรายชื่อแอดมินที่สามารถเพิ่มเป็นผู้ดูแลงานได้
export const findAvailableAdmins = async () => {
    return prisma.admin.findMany({
        select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
            profile_pic: true
        },
        orderBy: {
            first_name: 'asc'
        }
    });
};


export const findUsers = async (limit, offset, searchParams = {}) => {
    const where = {
        AND: [
            {
                OR: [
                    { first_name: { contains: searchParams.search, mode: 'insensitive' } },
                    { last_name: { contains: searchParams.search, mode: 'insensitive' } },
                    { email: { contains: searchParams.search, mode: 'insensitive' } },
                    { national_id: { contains: searchParams.search } }
                ]
            }
        ]
    };

    // เพิ่ม filter ตาม status ถ้ามีการระบุ
    if (searchParams.status) {
        where.AND.push({ approved: searchParams.status });
    }

    return prisma.user.findMany({
        where,
        select: {
            id: true,
            prefix: true,
            first_name: true,
            last_name: true,
            email: true,
            national_id: true,
            phone_number: true,
            profile_image: true,
            approved: true,
            created_at: true,
            updated_at: true,
            gender: true,
            birth_date: true,
            education_certificate: true,
            line_id: true,
            skills: true
        },
        orderBy: { created_at: 'desc' },
        take: limit,
        skip: offset
    });
};

export const countUsers = async (searchParams = {}) => {
    const where = {
        AND: [
            {
                OR: [
                    { first_name: { contains: searchParams.search, mode: 'insensitive' } },
                    { last_name: { contains: searchParams.search, mode: 'insensitive' } },
                    { email: { contains: searchParams.search, mode: 'insensitive' } },
                    { national_id: { contains: searchParams.search } }
                ]
            }
        ]
    };

    if (searchParams.status) {
        where.AND.push({ approved: searchParams.status });
    }

    return prisma.user.count({ where });
};

export const createUserByAdmin = async (userData) => {
    return prisma.user.create({
        data: userData,
        select: {
            id: true,
            prefix: true,
            first_name: true,
            last_name: true,
            email: true,
            national_id: true,
            phone_number: true,
            gender: true,
            birth_date: true,
            age: true,
            line_id: true,
            skills: true,
            profile_image: true,
            education_certificate: true,
            user_documents: true,
            approved: true,
            created_at: true
        }
    });
};

export const updateUserByAdmin = async (userId, userData) => {
    return prisma.user.update({
        where: { id: parseInt(userId) },
        data: userData,
        select: {
            id: true,
            prefix: true,
            first_name: true,
            last_name: true,
            email: true,
            national_id: true,
            phone_number: true,
            gender: true,
            birth_date: true,
            age: true,
            line_id: true,
            skills: true,
            profile_image: true,
            education_certificate: true,
            user_documents: true,
            approved: true,
            updated_at: true
        }
    });
};