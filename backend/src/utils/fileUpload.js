import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        try {
            const uploadPath = file.fieldname === 'profile_image'
                ? path.join(__dirname, '../../uploads/profiles/')
                : path.join(__dirname, '../../uploads/certificates/');
            await fs.mkdir(uploadPath, { recursive: true });
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
    } else {
        return cb(new Error('Unexpected field'), false);
    }
    cb(null, true);
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // จำกัดขนาดไฟล์ที่ 5MB
}).fields([
    { name: 'profile_image', maxCount: 1 },
    { name: 'education_certificate', maxCount: 1 }
]);
