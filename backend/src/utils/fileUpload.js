import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        try {
            let uploadPath;
            if (file.fieldname === 'profile_image') {
                uploadPath = path.join(__dirname, '../../uploads/profiles/');
            } else if (file.fieldname === 'education_certificate') {
                uploadPath = path.join(__dirname, '../../uploads/certificates/');
            } else if (file.fieldname === 'user_documents') {
                uploadPath = path.join(__dirname, '../../uploads/documents/');
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
    filename: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
        cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.fieldname === 'profile_image') {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
            return cb(new Error('โปรดอัปโหลดรูปภาพเท่านั้น'));
        }
    } else if (file.fieldname === 'education_certificate') {
        if (!file.originalname.match(/\.(pdf|jpg|jpeg|png)$/)) {
            return cb(new Error('โปรดอัปโหลดไฟล์ PDF หรือรูปภาพเท่านั้นสำหรับวุฒิการศึกษา'));
        }
    } else if (file.fieldname === 'user_documents') {
        if (!file.originalname.match(/\.(pdf|jpg|jpeg|png)$/)) {  // อนุญาตให้ใช้ PDF หรือไฟล์รูปภาพใน user_documents
            return cb(new Error('โปรดอัปโหลดไฟล์ PDF หรือรูปภาพเท่านั้นใน user_documents'));
        }
    } else {
        return cb(new Error('Unexpected field'), false);
    }
    cb(null, true);
};


export const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // จำกัดขนาดไฟล์ที่ 5MB
}).fields([
    { name: 'profile_image', maxCount: 1 },
    { name: 'education_certificate', maxCount: 1 },
    { name: 'user_documents', maxCount: 5 }  // รองรับไฟล์หลายไฟล์ในฟิลด์นี้
]);


export const deleteFile = (filePath) => {
    if (fs.existsSync(filePath)) {
        try {
            fs.unlinkSync(filePath); // ลบไฟล์อย่างซิงค์ (หรือใช้ fs.unlink สำหรับแบบแอสิงค์)
            console.log(`ลบไฟล์ ${filePath} สำเร็จ`);
        } catch (error) {
            console.error(`เกิดข้อผิดพลาดในการลบไฟล์ ${filePath}:`, error);
        }
    } else {
        console.log(`ไม่พบไฟล์ที่ต้องการลบ: ${filePath}`);
    }
};