import jwt from 'jsonwebtoken';

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
        req.user = decoded; // เก็บข้อมูลผู้ใช้ใน req.user
        next(); // ไปยัง middleware ถัดไป
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token' });
    }
};


export const checkAdminRole = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied, admin only' });
    }
    next();
};
