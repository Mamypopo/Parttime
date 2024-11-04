import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker/locale/th';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const USERS_TO_CREATE = 1000;
const ADMINS_TO_CREATE = 10;
const JOBS_TO_CREATE = 100;

async function clearDatabase() {
    console.log('กำลังลบข้อมูลเก่า...');
    await prisma.notification.deleteMany({});
    await prisma.jobParticipation.deleteMany({});
    await prisma.jobPosition.deleteMany({});
    await prisma.job.deleteMany({});
    await prisma.log.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.admin.deleteMany({});
    console.log('ลบข้อมูลเก่าเสร็จสิ้น');
}

async function generateUsers() {
    console.log('กำลังสร้างข้อมูลผู้ใช้...');

    for (let i = 0; i < USERS_TO_CREATE; i++) {
        const birthDate = faker.date.birthdate({ min: 18, max: 60, mode: 'age' });
        const skills = [
            'JavaScript',
            'Python',
            'Java',
            'React',
            'Vue',
            'Node.js',
            'PHP',
            'SQL',
            'HTML',
            'CSS'
        ];

        const randomSkills = faker.helpers.arrayElements(skills,
            faker.number.int({ min: 2, max: 4 })
        );

        await prisma.user.create({
            data: {
                email: `user${i}${faker.internet.email()}`,
                password: await bcrypt.hash('password123', 10),
                prefix: faker.helpers.arrayElement(['นาย', 'นาง', 'นางสาว']),
                first_name: faker.person.firstName(),
                last_name: faker.person.lastName(),
                national_id: faker.string.numeric(13),
                gender: faker.helpers.arrayElement(['ชาย', 'หญิง']),
                birth_date: birthDate,
                age: new Date().getFullYear() - birthDate.getFullYear(),
                education_certificate: 'certificate.pdf',
                phone_number: faker.phone.number('08########'),
                line_id: faker.internet.userName(),
                profile_image: 'default-profile.jpg',
                skills: JSON.stringify(randomSkills),
                email_verified: faker.datatype.boolean(),
                verification_token: faker.string.uuid(),
                approved: faker.helpers.arrayElement(['pending', 'approved', 'rejected']),
                role: faker.helpers.arrayElement(['user', 'admin']),
                user_documents: 'documents.pdf',
                created_at: faker.date.between({
                    from: '2023-01-01T00:00:00.000Z',
                    to: new Date()
                }),
                updated_at: new Date()
            }
        });
    }
    console.log(`สร้างผู้ใช้ ${USERS_TO_CREATE} คนเสร็จสิ้น`);
}


// async function generateAdmins() {
//     console.log('กำลังสร้างข้อมูลผู้ดูแลระบบ...');
//     for (let i = 0; i < ADMINS_TO_CREATE; i++) {
//         await prisma.admin.create({
//             data: {
//                 email: `admin${i}${faker.internet.email()}`,
//                 password: faker.internet.password(),
//                 first_name: faker.person.firstName(),
//                 last_name: faker.person.lastName(),
//                 role: 'admin'
//             }
//         });
//     }
//     console.log(`สร้างผู้ดูแลระบบ ${ADMINS_TO_CREATE} คนเสร็จสิ้น`);
// }

// async function generateJobs() {
//     console.log('กำลังสร้างข้อมูลงาน...');
//     const admins = await prisma.admin.findMany();
//     for (let i = 0; i < JOBS_TO_CREATE; i++) {
//         const job = await prisma.job.create({
//             data: {
//                 title: faker.company.catchPhrase(),
//                 work_date: faker.date.future(),
//                 location: faker.location.city(),
//                 start_time: faker.date.future(),
//                 end_time: faker.date.future(),
//                 completed: faker.datatype.boolean(),
//                 details: faker.lorem.paragraph(),
//                 created_by: faker.helpers.arrayElement(admins).id,
//             }
//         });

//         // สร้าง JobPositions แยกต่างหาก
//         const positionsCount = faker.number.int({ min: 1, max: 5 });
//         for (let j = 0; j < positionsCount; j++) {
//             await prisma.jobPosition.create({
//                 data: {
//                     job_id: job.id,
//                     position_name: faker.person.jobTitle(),
//                     wage: faker.number.float({ min: 300, max: 1000, precision: 2 }),
//                     required_people: faker.number.int({ min: 1, max: 10 }),
//                     details: faker.lorem.sentence(),
//                     status: faker.helpers.arrayElement(['open', 'closed', 'filled'])
//                 }
//             });
//         }

//         // สร้าง JobParticipation สำหรับแต่ละตำแหน่งงาน
//         const users = await prisma.user.findMany({ take: 10 });
//         const positions = await prisma.jobPosition.findMany({ where: { job_id: job.id } });
//         for (const position of positions) {
//             const participantsCount = faker.number.int({ min: 0, max: position.required_people });
//             for (let j = 0; j < participantsCount; j++) {
//                 await prisma.jobParticipation.create({
//                     data: {
//                         user_id: faker.helpers.arrayElement(users).id,
//                         job_position_id: position.id,
//                         status: faker.helpers.arrayElement(['pending', 'approved', 'rejected']),
//                         jobId: job.id
//                     }
//                 });
//             }
//         }
//     }
//     console.log(`สร้างงาน ${JOBS_TO_CREATE} งานเสร็จสิ้น`);
// }
// async function generateNotifications() {
//     console.log('กำลังสร้างการแจ้งเตือน...');
//     const users = await prisma.user.findMany({ take: 50 });
//     const admins = await prisma.admin.findMany();
//     const jobs = await prisma.job.findMany({ take: 20 });

//     for (let i = 0; i < 200; i++) {
//         await prisma.notification.create({
//             data: {
//                 message: faker.lorem.sentence(),
//                 userId: faker.helpers.arrayElement(users).id,
//                 adminId: faker.helpers.arrayElement(admins).id,
//                 jobId: faker.helpers.arrayElement(jobs).id
//             }
//         });
//     }
//     console.log('สร้างการแจ้งเตือนเสร็จสิ้น');
// }

async function generateMockData() {
    try {
        // await clearDatabase();
        await generateUsers();
        // await generateAdmins();
        // await generateJobs();
        // await generateNotifications();
        console.log('สร้างข้อมูลจำลองทั้งหมดเสร็จสิ้น');
    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการสร้างข้อมูล:', error);
    } finally {
        await prisma.$disconnect();
    }
}

generateMockData();