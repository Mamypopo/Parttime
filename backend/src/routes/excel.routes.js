import { Router } from 'express'
import { importUsers } from '../controllers/import.controller.js'
import { uploadExcel } from '../middleware/upload.js'
import { authMiddleware } from '../middleware/authMiddleware.js'

const router = Router()

router.post(
    '/import',
    authMiddleware,
    uploadExcel.single('file'),
    importUsers
)

export default router 