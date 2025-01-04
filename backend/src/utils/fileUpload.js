import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import * as paymentModel from '../models/paymentModel.js'
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        try {
            let uploadPath;
            switch (file.fieldname) {
                case 'profile_pic':
                    uploadPath = path.join(__dirname, '../../uploads/admin-profiles/');
                    break;
                case 'profile_image':
                    uploadPath = path.join(__dirname, '../../uploads/profiles/');
                    break;
                case 'education_certificate':
                    uploadPath = path.join(__dirname, '../../uploads/certificates/');
                    break;
                case 'user_documents':
                    uploadPath = path.join(__dirname, '../../uploads/documents/');
                    break;
                case 'summaries':
                    uploadPath = path.join(__dirname, '../../uploads/summaries/');
                    break;
                case 'payment_slip':
                    uploadPath = path.join(__dirname, '../../uploads/payment-slips/');
                    break;

                default:
                    return cb(new Error('Invalid field name'), null);
            }

            // สร้างโฟลเดอร์หากไม่มี
            if (!fs.existsSync(uploadPath)) {
                fs.mkdirSync(uploadPath, { recursive: true });
            }
            cb(null, uploadPath);
        } catch (error) {
            cb(error, null);
        }
    },
    filename: async (req, file, cb) => {
        try {
            let fileName;

            switch (file.fieldname) {
                case 'payment_slip':
                    // รูปแบบพิเศษสำหรับสลิปการจ่ายเงิน
                    const payment = await paymentModel.getPaymentById(req.params.id);
                    const jobTitle = payment.job_participation.jobPosition.job.title
                        .replace(/[^a-zA-Z0-9ก-๙]/g, '_')
                        .replace(/_{2,}/g, '_')
                        .replace(/^_|_$/g, '')
                        .substring(0, 50);

                    fileName = `job${payment.job_participation.jobPosition.job.id}_` +
                        `${jobTitle}_` +
                        `user${payment.job_participation.user.id}_` +
                        `payment${payment.id}_` +
                        `${Date.now()}${path.extname(file.originalname)}`;
                    break;

                default:
                    // รูปแบบทั่วไปสำหรับไฟล์อื่นๆ
                    fileName = `${file.fieldname}-${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
            }

            cb(null, fileName);
        } catch (error) {
            console.error('Error creating filename:', error);
            cb(error, null);
        }
    }
});



const fileFilter = (req, file, cb) => {
    // ตรวจสอบ fieldname ที่ถูกส่งมา
    if (file.fieldname === 'profile_pic') {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('อนุญาตเฉพาะไฟล์ .jpg .jpeg และ .png เท่านั้น'), false);
        }
        cb(null, true);
        return;
    }

    if (file.fieldname === 'profile_image') {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('โปรดอัปโหลดรูปภาพเท่านั้น'), false);
        }
        cb(null, true);
        return;
    }

    if (file.fieldname === 'education_certificate') {
        if (!file.originalname.match(/\.(pdf|jpg)$/)) {
            return cb(new Error('โปรดอัปโหลดไฟล์ .PDF หรือ .jpg เท่านั้นสำหรับวุฒิการศึกษา'), false);
        }
        cb(null, true);
        return;
    }

    if (file.fieldname === 'user_documents') {
        if (!file.originalname.match(/\.(pdf|)$/)) {
            return cb(new Error('โปรดอัปโหลดไฟล์ .PDF หรือ .jpg เท่านั้นใน user_documents'), false);
        }
        cb(null, true);
        return;
    }

    if (file.fieldname === 'payment_slip') {
        if (!file.originalname.match(/\.(jpg)$/)) {
            return cb(new Error('อนุญาตเฉพาะไฟล์ .jpg  เท่านั้นสำหรับสลิปการโอนเงิน'), false);
        }
        cb(null, true);
        return;
    }

    // ถ้าไม่ตรงกับ fieldname ใดๆ
    cb(new Error('Unexpected field'), false);
};
export const adminUpload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 2 * 1024 * 1024 } // จำกัดขนาด 2MB
}).single('profile_pic');


export const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // จำกัดขนาดไฟล์ที่ 5MB
}).fields([
    { name: 'profile_image', maxCount: 1 },
    { name: 'education_certificate', maxCount: 1 },
    { name: 'user_documents', maxCount: 5 }  // รองรับไฟล์หลายไฟล์ในฟิลด์นี้
]);

// ฟังก์ชัน upload สำหรับ payment_slip
export const uploadPaymentSlip = (req, res, next) => {

    const multerUpload = multer({
        storage: storage,
        fileFilter: fileFilter,
        limits: { fileSize: 5 * 1024 * 1024 } // จำกัดขนาดไฟล์ 5MB
    }).single('payment_slip');

    multerUpload(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({ message: `Multer Error: ${err.message}` });
        } else if (err) {
            return res.status(400).json({ message: `Upload Error: ${err.message}` });
        }
        next();
    });
};

export const deleteFile = (filePath) => {
    if (fs.existsSync(filePath)) {
        try {
            fs.unlinkSync(filePath);
            console.log(`ลบไฟล์ ${filePath} สำเร็จ`);
        } catch (error) {
            console.error(`เกิดข้อผิดพลาดในการลบไฟล์ ${filePath}:`, error);
        }
    } else {
        console.log(`ไม่พบไฟล์ที่ต้องการลบ: ${filePath}`);
    }
};

// middleware จัดการ error จาก multer
export const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                message: 'ไฟล์มีขนาดใหญ่เกินไป (ไม่เกิน 2MB)'
            });
        }
        return res.status(400).json({
            message: `เกิดข้อผิดพลาดในการอัพโหลดไฟล์: ${err.message}`
        });
    } else if (err) {
        return res.status(400).json({
            message: err.message
        });
    }
    next();
};