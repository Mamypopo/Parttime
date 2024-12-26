import jwt from 'jsonwebtoken';
import * as adminModel from '../models/adminModel.js'

// ตรวจสอบ token
export const authMiddleware = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1]; // แยก token ออกมา

    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    try {
        // ตรวจสอบและถอดรหัส token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = {
            id: decoded.userId || decoded.id, // รองรับทั้ง userId และ id
            email: decoded.email,
            role: decoded.role
        };
        next(); // ไปยัง middleware ถัดไป
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token' });
    }
};

// ตรวจสอบว่าเป็น แอดมินหรือป่าว
export const checkAdminRole = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'กรุณาเข้าสู่ระบบ' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!decoded.userId) {
            return res.status(401).json({
                message: 'Token ไม่ถูกต้อง กรุณาเข้าสู่ระบบใหม่'
            });
        }

        const admin = await adminModel.getAdminById(decoded.userId);

        if (!admin) {
            return res.status(401).json({ message: 'ไม่พบข้อมูลแอดมิน' });
        }

        req.admin = admin;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(401).json({
            message: 'การยืนยันตัวตนล้มเหลว',
            error: error.message
        });
    }
};