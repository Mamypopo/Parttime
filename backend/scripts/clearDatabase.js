import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clearDatabase() {
    try {
        // ลบข้อมูลตามลำดับ เริ่มจากตารางที่มี Foreign key ไปยังตารางหลัก
        console.log('เริ่มล้างข้อมูล...');

        // ลบ JobParticipation ก่อน (ถ้ามี)
        await prisma.jobParticipation.deleteMany();
        console.log('ล้างข้อมูล JobParticipation เรียบร้อย');

        // ลบ JobPosition
        await prisma.jobPosition.deleteMany();
        console.log('ล้างข้อมูล JobPosition เรียบร้อย');

        // ลบ Job
        await prisma.job.deleteMany();
        console.log('ล้างข้อมูล Job เรียบร้อย');

        // ลบ Notification
        await prisma.notification.deleteMany();
        console.log('ล้างข้อมูล Notification เรียบร้อย');

        await prisma.pendingSkill.deleteMany();
        console.log('ล้างข้อมูล pendingSkill เรียบร้อย');

        // ลบ User
        await prisma.user.deleteMany();
        console.log('ล้างข้อมูล User เรียบร้อย');

        // ลบ Admin
        await prisma.admin.deleteMany();
        console.log('ล้างข้อมูล Admin เรียบร้อย');


        console.log('ล้างข้อมูลในฐานข้อมูลเรียบร้อยแล้ว');
    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการล้างข้อมูล:', error);
    } finally {
        await prisma.$disconnect();
    }
}

clearDatabase();