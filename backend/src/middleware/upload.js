import multer from 'multer'

const uploadExcel = multer({
    storage: multer.memoryStorage(),
    fileFilter: (req, file, cb) => {
        if (
            file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
            file.mimetype === 'application/vnd.ms-excel'
        ) {
            cb(null, true)
        } else {
            cb(new Error('รองรับเฉพาะไฟล์ Excel เท่านั้น'))
        }
    },
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    }
})

export {
    uploadExcel
} 