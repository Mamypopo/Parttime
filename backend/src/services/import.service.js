import { PrismaClient } from '@prisma/client'
import * as XLSX from 'xlsx'
import { createLog } from '../models/logModel.js'

const prisma = new PrismaClient()

const defaultSkills = [
    'เอกซเรย์',
    'พยาบาล',
    'น้ำหนัก ส่วนสูง',
    'ทะเบียน',
    'การได้ยิน',
    'เจาะเลือด',
    'เป่าปอด',
    'ตาอาชีวะ',
    'ตาทั่วไป',
    'มวลกระดูก',
    'เก็บปัสสาวะ',
    'คลื่นไฟฟ้าหัวใจ',
    'กล้ามเนื้อ',
    'มะเร็งปากมดลูก',
    'อัลตร้าซาวด์',
    'ผู้ช่วยแพทย์',
    'วัดความดัน',
    'ยานพาหนะ',
    'หมอ'
]

function romanizeThaiName(text) {
    const thaiToEnglish = {
        'ก': 'k', 'ข': 'kh', 'ค': 'kh', 'ฆ': 'kh', 'ง': 'ng',
        'จ': 'ch', 'ฉ': 'ch', 'ช': 'ch', 'ซ': 's', 'ฌ': 'ch',
        'ญ': 'y', 'ฎ': 'd', 'ฏ': 't', 'ฐ': 'th', 'ฑ': 'th',
        'ฒ': 'th', 'ณ': 'n', 'ด': 'd', 'ต': 't', 'ถ': 'th',
        'ท': 'th', 'ธ': 'th', 'น': 'n', 'บ': 'b', 'ป': 'p',
        'ผ': 'ph', 'ฝ': 'f', 'พ': 'ph', 'ฟ': 'f', 'ภ': 'ph',
        'ม': 'm', 'ย': 'y', 'ร': 'r', 'ล': 'l', 'ว': 'w',
        'ศ': 's', 'ษ': 's', 'ส': 's', 'ห': 'h', 'ฬ': 'l',
        'อ': 'a', 'ฮ': 'h',
        // สระ
        'ะ': 'a', 'า': 'a', 'ิ': 'i', 'ี': 'i', 'ึ': 'ue',
        'ื': 'ue', 'ุ': 'u', 'ู': 'u', 'เ': 'e', 'แ': 'ae',
        'โ': 'o', 'ำ': 'am'
    }

    let result = ''
    for (let i = 0; i < text.length; i++) {
        result += thaiToEnglish[text[i]] || text[i]
    }
    return result.toLowerCase()
}
class ImportService {
    async processExcelFile(file, adminId, ip, userAgent) {
        try {
            const workbook = XLSX.read(file.buffer)
            const worksheet = workbook.Sheets[workbook.SheetNames[0]]
            const jsonData = XLSX.utils.sheet_to_json(worksheet)

            const usersToCreate = []
            const errors = []
            const existingEmails = new Set()
            const lastUser = await prisma.user.findFirst({
                where: {
                    national_id: {
                        startsWith: 'T'
                    }
                },
                orderBy: {
                    national_id: 'desc'
                }
            })

            let currentNumber = 0
            if (lastUser) {
                const lastNumber = parseInt(lastUser.national_id.substring(1))
                currentNumber = lastNumber
            }

            for (const [index, row] of jsonData.entries()) {
                try {
                    if (!row['ชื่อ']) {
                        throw new Error('ไม่พบข้อมูลชื่อ')
                    }

                    const email = await this.generateEmail(row['ชื่อ'], index + 1)

                    const existingUser = await prisma.user.findUnique({
                        where: { email }
                    })

                    if (existingUser) {
                        throw new Error(`อีเมล ${email} มีในระบบแล้ว`)
                    }

                    currentNumber++
                    const nationalId = `T${currentNumber.toString().padStart(12, '0')}`

                    const rawPrefix = row['คำนำหน้า']?.trim() || ''
                    const normalizedPrefix = rawPrefix.toLowerCase()
                    const prefixMapping = {
                        'mr': 'นาย',
                        'mr.': 'นาย',
                        'mrs': 'นาง',
                        'mrs.': 'นาง',
                        'miss': 'นางสาว',
                        'ms': 'นางสาว',
                        'ms.': 'นางสาว'
                    }
                    const thaiPrefix = prefixMapping[normalizedPrefix] || rawPrefix
                    const userData = {
                        first_name: row['ชื่อ']?.trim(),
                        last_name: row['นามสกุล']?.trim() || '',
                        prefix: thaiPrefix,
                        gender: this.getGenderFromPrefix(row['คำนำหน้า']),
                        national_id: nationalId,
                        email,
                        password: `temp${nationalId.slice(-4)}`,
                        source_type: 'import_excel',
                        approved: 'approved',
                        role: 'user',
                        birth_date: new Date(Date.now() - (20 * 365 * 24 * 60 * 60 * 1000)),
                        skills: JSON.stringify(defaultSkills),
                        education_certificate: 'default_certificate.jpg',
                        age: 20,
                        phone_number: row['เบอร์โทร']?.trim() || '0000000000'
                    }

                    usersToCreate.push(userData)
                } catch (error) {
                    errors.push(`แถวที่ ${index + 1}: ${error.message}`)
                }
            }

            if (errors.length > 0) {
                throw new Error('พบข้อผิดพลาดในข้อมูล:\n' + errors.join('\n'))
            }

            const result = await prisma.$transaction(async (prisma) => {
                const createdUsers = []
                const logs = []
                for (const userData of usersToCreate) {
                    const user = await prisma.user.create({
                        data: userData
                    })
                    createdUsers.push(user)
                    logs.push({
                        action: 'IMPORT_USER',
                        request_url: '/api/excel/import',
                        method: 'POST',
                        details: JSON.stringify({
                            action: 'import_user',
                            user_email: user.email,
                            source: 'excel_import'
                        }),
                        ip_address: ip,
                        user_agent: userAgent,
                        timestamp: new Date(),
                        user: { connect: { id: user.id } },
                        admin: { connect: { id: adminId } }
                    })
                }

                for (const logData of logs) {
                    await prisma.log.create({
                        data: logData
                    })
                }

                await prisma.log.create({
                    data: {
                        action: 'IMPORT_USERS_SUMMARY',
                        request_url: '/api/excel/import',
                        method: 'POST',
                        details: JSON.stringify({
                            total_processed: jsonData.length,
                            success_count: createdUsers.length,
                            error_count: errors.length,
                            errors: errors
                        }),
                        ip_address: ip,
                        user_agent: userAgent,
                        timestamp: new Date(),
                        admin: { connect: { id: adminId } }
                    }
                })
                return {
                    imported: createdUsers.length,
                    errors: []
                }
            })

            return result

        } catch (error) {
            await prisma.log.create({
                data: {
                    action: 'IMPORT_USERS_ERROR',
                    request_url: '/api/excel/import',
                    method: 'POST',
                    details: JSON.stringify({
                        error: error.message,
                        stack: error.stack
                    }),
                    ip_address: ip,
                    user_agent: userAgent,
                    timestamp: new Date(),
                    admin: { connect: { id: adminId } }
                }
            })
            console.error('Process error:', error)
            return {
                imported: 0,
                errors: [error.message]
            }
        }
    }

    getGenderFromPrefix(prefix) {
        if (!prefix) return 'ไม่ระบุ'

        const normalizedPrefix = prefix.toLowerCase().trim()

        const prefixMapping = {
            'mr': 'นาย',
            'mr.': 'นาย',
            'mrs': 'นาง',
            'mrs.': 'นาง',
            'miss': 'นางสาว',
            'ms': 'นางสาว',
            'ms.': 'นางสาว'
        }

        const thaiPrefix = prefixMapping[normalizedPrefix] || prefix

        const malePrefix = ['นาย']
        const femalePrefix = ['นางสาว', 'นาง']

        if (malePrefix.includes(thaiPrefix)) return 'ชาย'
        if (femalePrefix.includes(thaiPrefix)) return 'หญิง'
        return 'ไม่ระบุ'
    }

    async generateEmail(name, index) {
        try {
            const timestamp = Date.now()

            if (/[\u0E00-\u0E7F]/.test(name)) {
                const romanizedName = romanizeThaiName(name)
                const cleanName = romanizedName
                    .toLowerCase()
                    .trim()
                    .replace(/\s+/g, '_')
                    .replace(/[^\w\s]/g, '')
                    .replace(/-/g, '_')
                return `${cleanName}_${index}@temp.com`
            }

            const cleanName = name.toLowerCase()
                .trim()
                .replace(/\s+/g, '_')
                .replace(/[^\w\s]/g, '')
                .replace(/-/g, '_')

            return `${cleanName}_${index}@temp.com`
        } catch (error) {
            console.error('Error generating email:', error)
            return `temp_${timestamp}_${index}@temp.com`
        }
    }
}

export {
    ImportService
} 