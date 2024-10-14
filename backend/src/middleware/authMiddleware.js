import jwt from 'jsonwebtoken';

export const authMiddleware = (req, res, next) => {
    // ดึง token จาก headers
    const token = req.headers['authorization']?.split(' ')[1];  // ปกติใช้ Bearer Token

    if (!token) {
        return res.status(403).json({ message: 'No token provided' });
    }

    try {
        // ตรวจสอบความถูกต้องของ token
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // ใช้ key เดียวกันกับตอนสร้าง token
        req.user = decoded;  // เก็บข้อมูลผู้ใช้ที่ถูก decode ไว้ใน req.user
        next();  // ดำเนินการต่อ
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token' });
    }
};
