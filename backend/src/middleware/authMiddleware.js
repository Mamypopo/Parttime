import jwt from 'jsonwebtoken';

export const authMiddleware = (req, res, next) => {
    console.log('Verifying token...');
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
        // req.user = decoded;
        req.user = {
            id: decoded.userId || decoded.id, // รองรับทั้ง userId และ id
            email: decoded.email,
            role: decoded.role
        };
        console.log('Decoded token:', decoded); // เพิ่ม log นี้
        next(); // ไปยัง middleware ถัดไป
    } catch (error) {
        console.error('Token verification error:', error);
        return res.status(401).json({ message: 'Invalid token' });
    }
};


export const checkAdminRole = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied, admin only' });
    }
    next();
};