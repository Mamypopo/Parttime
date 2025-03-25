import { ImportService } from '../services/import.service.js'

const importUsers = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'กรุณาอัพโหลดไฟล์' })
        }

        const importService = new ImportService()
        const result = await importService.processExcelFile(
            req.file,
            req.user.id,
            req.ip,
            req.headers['user-agent']
        )
        return res.status(200).json({
            message: 'Import ข้อมูลสำเร็จ',
            imported: result.imported,
            errors: result.errors,
            duplicates: result.duplicates || []
        })

    } catch (error) {
        console.error('Import error:', error)
        return res.status(500).json({
            message: error.message || 'เกิดข้อผิดพลาดในการ import ข้อมูล'
        })
    }
}

export {
    importUsers
} 