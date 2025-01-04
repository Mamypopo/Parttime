import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clearDatabase() {
    try {
        console.log('เริ่มล้างข้อมูล...');

        // ลบ WorkHistory
        await prisma.workHistory.deleteMany({});
        console.log('ล้างข้อมูล WorkHistory เรียบร้อย');

        // ลบ PaymentLog ก่อน PaymentHistory
        await prisma.paymentLog.deleteMany();
        console.log('ล้างข้อมูล PaymentLog เรียบร้อย');

        // ลบ PaymentHistory
        await prisma.paymentHistory.deleteMany();
        console.log('ล้างข้อมูล PaymentHistory เรียบร้อย');

        // ลบ JobParticipation
        await prisma.jobParticipation.deleteMany();
        console.log('ล้างข้อมูล JobParticipation เรียบร้อย');

        // ลบ JobPosition
        await prisma.jobPosition.deleteMany();
        console.log('ล้างข้อมูล JobPosition เรียบร้อย');


        // การลบ JobAdmins ก่อนลบ Job
        await prisma.JobAdmins.deleteMany();
        console.log('ล้างข้อมูล JobAdmin เรียบร้อย');

        // ลบ Job
        await prisma.job.deleteMany();
        console.log('ล้างข้อมูล Job เรียบร้อย');

        // ลบ Notification
        await prisma.notification.deleteMany();
        console.log('ล้างข้อมูล Notification เรียบร้อย');

        // ลบ PendingSkill
        await prisma.pendingSkill.deleteMany();
        console.log('ล้างข้อมูล pendingSkill เรียบร้อย');

        // ลบ Log
        await prisma.log.deleteMany();
        console.log('ล้างข้อมูล Log เรียบร้อย');

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