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

    if (searchParams.skill) {
        let skillArray = [];

        if (typeof searchParams.skill === 'string') {
            skillArray = searchParams.skill.split(',');
        } else if (Array.isArray(searchParams.skill)) {
            skillArray = searchParams.skill;
        }

        if (skillArray.length > 0) {
            whereClause.OR = skillArray.map(skill => ({
                skills: {
                    contains: skill.trim(),
                    mode: 'insensitive'
                }
            }));
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

export const countUsersPending = async (searchParams = {}) => {
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

    if (searchParams.skill) {
        let skillArray = [];

        if (typeof searchParams.skill === 'string') {
            skillArray = searchParams.skill.split(',');
        } else if (Array.isArray(searchParams.skill)) {
            skillArray = searchParams.skill;
        }

        if (skillArray.length > 0) {
            whereClause.OR = skillArray.map(skill => ({
                skills: {
                    contains: skill.trim(),
                    mode: 'insensitive'
                }
            }));
        }
    }

    const totalCount = await prisma.user.count({
        where: whereClause
    });

    return totalCount;
}



// ดึงผู้ใช้ที่อนุมัติแล้ว
export const findApprovedUsers = (limit = 10, offset = 0, searchParams = {}) => {
    const whereClause = {
        approved: "approved"
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

    // ค้นหาชื่อ-นามสกุล
    if (searchParams.name) {
        // แยกคำค้นหาด้วย space
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

export const countUsersApproved = async (searchParams = {}) => {
    const whereClause = {
        approved: "approved"
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

    // ส่งค่ากลับเป็นตัวเลขโดยตรง ไม่ใช่ object
    return totalCount;
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

    if (searchParams.skill) {
        let skillArray = [];

        if (typeof searchParams.skill === 'string') {
            skillArray = searchParams.skill.split(',');
        } else if (Array.isArray(searchParams.skill)) {
            skillArray = searchParams.skill;
        }

        if (skillArray.length > 0) {
            whereClause.OR = skillArray.map(skill => ({
                skills: {
                    contains: skill.trim(),
                    mode: 'insensitive'
                }
            }));
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

    if (searchParams.skill) {
        let skillArray = [];

        if (typeof searchParams.skill === 'string') {
            skillArray = searchParams.skill.split(',');
        } else if (Array.isArray(searchParams.skill)) {
            skillArray = searchParams.skill;
        }

        if (skillArray.length > 0) {
            whereClause.OR = skillArray.map(skill => ({
                skills: {
                    contains: skill.trim(),
                    mode: 'insensitive'
                }
            }));
        }
    }

    const totalCount = await prisma.user.count({
        where: whereClause
    });

    return totalCount;
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
    try {
        const where = {
            OR: [
                { first_name: { contains: searchParams.search || '', mode: 'insensitive' } },
                { last_name: { contains: searchParams.search || '', mode: 'insensitive' } },
                { email: { contains: searchParams.search || '', mode: 'insensitive' } },
                { national_id: { contains: searchParams.search || '' } }
            ]
        };

        if (searchParams.status) {
            where.approved = searchParams.status;
        }

        const allUsers = await prisma.user.findMany({
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
                user_documents: true,
                education_certificate: true,
                line_id: true,
                skills: true,
                _count: {
                    select: {
                        JobParticipation: true
                    }
                },
                JobParticipation: {
                    select: {
                        id: true,
                        workHistories: {
                            select: {
                                id: true,
                                total_score: true
                            }
                        }
                    }
                }
            }
        });

        const processedUsers = allUsers.map(user => {
            let userSkills = [];
            if (user.skills) {
                try {
                    userSkills = typeof user.skills === 'string' ? JSON.parse(user.skills) : user.skills;
                } catch (e) {
                    console.error('Error parsing skills:', e);
                }
            }

            let totalScore = 0;
            let evaluationCount = 0;

            user.JobParticipation.forEach(participation => {
                participation.workHistories.forEach(history => {
                    if (history.total_score !== null && history.total_score !== undefined) {
                        totalScore += history.total_score;
                        evaluationCount++;
                    }
                });
            });

            const averageRating = evaluationCount > 0 ? (totalScore / evaluationCount) : 0;

            const { _count, JobParticipation, ...userData } = user;

            return {
                ...userData,
                skills: userSkills,
                total_jobs: _count.JobParticipation || 0,
                average_rating: parseFloat(averageRating.toFixed(1)),
                total_reviews: evaluationCount
            };
        });

        let filteredUsers = processedUsers;
        if (searchParams.skill && searchParams.skill.length > 0) {
            const skills = Array.isArray(searchParams.skill)
                ? searchParams.skill
                : [searchParams.skill];

            filteredUsers = processedUsers.filter(user => {
                return skills.some(skill => user.skills.includes(skill));
            });
        }

        if (searchParams.sortBy) {
            switch (searchParams.sortBy) {
                case 'rating_asc':
                    filteredUsers.sort((a, b) => a.average_rating - b.average_rating);
                    break;
                case 'rating_desc':
                    filteredUsers.sort((a, b) => b.average_rating - a.average_rating);
                    break;
                case 'jobs_asc':
                    filteredUsers.sort((a, b) => a.total_jobs - b.total_jobs);
                    break;
                case 'jobs_desc':
                    filteredUsers.sort((a, b) => b.total_jobs - a.total_jobs);
                    break;
                default:
                    filteredUsers.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            }
        }

        const paginatedUsers = filteredUsers.slice(offset, offset + parseInt(limit));

        return {
            users: paginatedUsers,
            total: filteredUsers.length
        };
    } catch (error) {
        console.error('Error in findUsers:', error);
        throw error;
    }
};

export const countUsers = async (searchParams = {}) => {
    try {
        // ใช้ผลลัพธ์จาก findUsers แทน
        const result = await findUsers(Number.MAX_SAFE_INTEGER, 0, searchParams);
        return result.total;
    } catch (error) {
        console.error('Error in countUsers:', error);
        throw error;
    }
};

export const createUserByAdmin = async (userData) => {
    return prisma.user.create({
        data: {
            ...userData,
            source_type: 'manual'
        },
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
            source_type: true,
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