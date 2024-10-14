const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    // สร้างผู้ใช้ตัวอย่าง
    const user1 = await prisma.user.create({
        data: {
            email: 'user1@example.com',
            password: 'password123',
            first_name: 'John',
            last_name: 'Doe',
            national_id: '1234567890123',
            gender: 'male',
            birth_date: new Date('1990-05-15'),
            education_level_url: 'Bachelor Degree',
            phone_number: '0123456789',
            line_id: 'johnline',
            unique_code: 'U123456',
        },
    });

    const user2 = await prisma.user.create({
        data: {
            email: 'user2@example.com',
            password: 'password123',
            first_name: 'Jane',
            last_name: 'Doe',
            national_id: '9876543210123',
            gender: 'female',
            birth_date: new Date('1992-10-21'),
            education_level_url: 'Master Degree',
            phone_number: '0987654321',
            line_id: 'janedoe',
            unique_code: 'U654321',
        },
    });

    // สร้างงานตัวอย่าง
    const job1 = await prisma.job.create({
        data: {
            job_name: 'Software Developer',
            position: 'Developer',
            job_date: new Date('2024-01-01'),
            start_time: new Date('2024-01-01T09:00:00'),
            end_time: new Date('2024-01-01T17:00:00'),
            wage: 5000,
            required_people: 2,
        },
    });

    const job2 = await prisma.job.create({
        data: {
            job_name: 'Graphic Designer',
            position: 'Designer',
            job_date: new Date('2024-01-10'),
            start_time: new Date('2024-01-10T09:00:00'),
            end_time: new Date('2024-01-10T17:00:00'),
            wage: 4000,
            required_people: 1,
        },
    });

    // สร้างข้อมูลการเข้าร่วมงาน (Job Participation)
    await prisma.jobParticipation.create({
        data: {
            userId: user1.id,
            jobId: job1.id,
            status: 'accepted',
            unique_code: 'P123456',
        },
    });

    await prisma.jobParticipation.create({
        data: {
            userId: user2.id,
            jobId: job2.id,
            status: 'pending',
            unique_code: 'P654321',
        },
    });

    console.log('Seed data created successfully');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
