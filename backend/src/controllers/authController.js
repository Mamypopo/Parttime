import crypto from 'crypto';
import { sendEmail } from '../utils/emailService';

export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        // ตรวจสอบว่ามีอีเมลนี้ในระบบหรือไม่
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(404).json({ message: 'ไม่พบอีเมลนี้ในระบบ' });
        }

        // สร้าง reset token และกำหนดเวลาหมดอายุ (30 นาที)
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = new Date(Date.now() + 30 * 60 * 1000);

        // บันทึก token ลงฐานข้อมูล
        await prisma.user.update({
            where: { email },
            data: {
                reset_password_token: resetToken,
                reset_password_expires: resetTokenExpiry
            }
        });

        // สร้าง reset URL
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

        // ส่งอีเมล
        await sendEmail({
            to: email,
            subject: 'รีเซ็ตรหัสผ่าน',
            html: `
                <h1>คำขอรีเซ็ตรหัสผ่าน</h1>
                <p>คุณได้ขอรีเซ็ตรหัสผ่าน กรุณาคลิกที่ลิงก์ด้านล่างเพื่อตั้งรหัสผ่านใหม่</p>
                <p>ลิงก์นี้จะหมดอายุใน 30 นาที</p>
                <a href="${resetUrl}">คลิกที่นี่เพื่อรีเซ็ตรหัสผ่าน</a>
            `
        });

        res.status(200).json({
            message: 'ส่งลิงก์รีเซ็ตรหัสผ่านไปยังอีเมลของคุณแล้ว'
        });

    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({
            message: 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง'
        });
    }
};

export const resetPassword = async (req, res) => {
    try {
        const { token, password } = req.body;

        // ตรวจสอบ token และเวลาหมดอายุ
        const user = await prisma.user.findFirst({
            where: {
                reset_password_token: token,
                reset_password_expires: {
                    gt: new Date()
                }
            }
        });

        if (!user) {
            return res.status(400).json({
                message: 'ลิงก์รีเซ็ตรหัสผ่านไม่ถูกต้องหรือหมดอายุแล้ว'
            });
        }

        // อัพเดทรหัสผ่านใหม่
        const hashedPassword = await bcrypt.hash(password, 10);
        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                reset_password_token: null,
                reset_password_expires: null
            }
        });

        res.status(200).json({
            message: 'รีเซ็ตรหัสผ่านสำเร็จ'
        });

    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({
            message: 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง'
        });
    }
};