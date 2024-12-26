import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { sendResetPasswordEmail } from '../utils/email.js';
import * as userModel from '../models/userModel.js'

// ลืมรหัสผ่าน
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        console.log('Forgot password request for email:', email);

        const user = await userModel.getUserByEmail(email);
        if (!user) {
            return res.status(404).json({ message: 'ไม่พบอีเมลนี้ในระบบ' });
        }

        const resetToken = jwt.sign(
            { email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        await userModel.updateResetToken(email, resetToken);
        const emailResult = await sendResetPasswordEmail({
            email: user.email,
            first_name: user.first_name,
            resetToken
        });

        res.status(200).json({
            message: 'ส่งลิงก์รีเซ็ตรหัสผ่านไปยังอีเมลของคุณแล้ว',
            previewUrl: emailResult.previewUrl
        });

    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง' });
    }
};

// RESET รหัสผ่าน
export const resetPassword = async (req, res) => {
    try {
        const { token, password } = req.body;

        let decodedToken;
        try {
            decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
            return res.status(400).json({
                message: 'ลิงก์รีเซ็ตรหัสผ่านไม่ถูกต้องหรือหมดอายุแล้ว'
            });
        }

        const user = await userModel.getUserByEmail(decodedToken.email);
        if (!user) {
            return res.status(400).json({
                message: 'ไม่พบผู้ใช้งานในระบบ'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await userModel.resetUserPassword(user.id, hashedPassword);

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