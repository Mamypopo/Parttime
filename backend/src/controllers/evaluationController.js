import ExcelJS from 'exceljs';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import * as evaluationModel from '../models/evaluationModel.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// สร้าง Excel สรุปการประเมิน
export const generateEvaluationExcel = async (req, res) => {
    const { jobId } = req.params;

    try {
        const job = await evaluationModel.getEvaluationByJobId(jobId);
        if (!job) return res.status(404).json({ message: 'ไม่พบงานที่ระบุ' });

        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Evaluation Summary');

        // Header หลักของไฟล์
        sheet.mergeCells('A1:L1');
        sheet.getCell('A1').value = `สรุปผลการประเมินงาน: ${job.title}`;
        sheet.getCell('A1').font = { bold: true, size: 16 };
        sheet.getCell('A1').alignment = { horizontal: 'center' };
        sheet.getCell('A1').fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'D9E1F2' }, // สีพื้นหลัง
        };

        sheet.mergeCells('A2:L2');
        sheet.getCell('A2').value = `สถานที่: ${job.location} | วันที่ทำงาน: ${job.work_date.toISOString().split('T')[0]} | วันที่ประเมิน: ${new Date().toISOString().split('T')[0]}`;
        sheet.getCell('A2').alignment = { horizontal: 'center' };
        sheet.addRow([]); // แถวว่างก่อนเริ่มตาราง

        // Header ของตาราง
        const headerRow = sheet.addRow([
            'ลำดับ',
            'ชื่อผู้สมัคร',
            'การแต่งกาย',
            'คุณภาพงาน',
            'ปริมาณงาน',
            'มารยาท',
            'ตรงต่อเวลา',
            'รวม',
            'ความคิดเห็น',
            'เพิ่มเติม',
        ]);
        headerRow.font = { bold: true, size: 10 };
        headerRow.alignment = { horizontal: 'center', vertical: 'middle' };

        // ปรับความกว้างของคอลัมน์
        const columnWidths = [5, 20, 12, 12, 12, 12, 12, 8, 20, 12];
        columnWidths.forEach((width, index) => {
            sheet.getColumn(index + 1).width = width;
        });

        sheet.getRow(1).height = 25; // Header หลัก
        sheet.getRow(2).height = 20; // รายละเอียดงาน

        // ข้อมูลตำแหน่งงานและผู้สมัคร
        job.JobPositions.forEach((position) => {
            sheet.addRow([]); // เว้นบรรทัดก่อนเริ่มตำแหน่งงาน
            const positionRow = sheet.addRow([`ตำแหน่ง: ${position.position_name}`]);
            positionRow.font = { bold: true, size: 10 };

            if (position.JobParticipation.length === 0) {
                // กรณีไม่มีผู้สมัคร
                sheet.addRow(['ไม่มีผู้สมัครในตำแหน่งนี้']).font = { italic: true, color: { argb: 'FF0000' } };
            } else {
                // วนลูปแสดงผู้สมัครในตำแหน่งนี้
                position.JobParticipation.forEach((participant, index) => {
                    const workHistory = participant.workHistories[0] || {};
                    const totalScore = ['appearance_score', 'quality_score', 'quantity_score', 'manner_score', 'punctuality_score']
                        .reduce((sum, key) => sum + (workHistory[key] || 0), 0);

                    const row = sheet.addRow([
                        index + 1,
                        `${participant.user.first_name} ${participant.user.last_name}`,
                        workHistory.appearance_score || '-',
                        workHistory.quality_score || '-',
                        workHistory.quantity_score || '-',
                        workHistory.manner_score || '-',
                        workHistory.punctuality_score || '-',
                        `${totalScore}/10`,
                        workHistory.comment || 'ไม่มีความคิดเห็น',
                    ]);

                    // จัด Alignment ให้อยู่ตรงกลาง และเพิ่มความสูงของแถว
                    row.alignment = { vertical: 'middle', horizontal: 'center' };
                    row.height = 20;
                });
            }
        });

        // ช่องสำหรับลายเซ็น
        sheet.addRow([]);
        sheet.addRow(['ลายเซ็นผู้ประเมิน: ....................................................']);
        sheet.addRow(['วันที่เซ็น: ...........................................................']);

        // สร้างและส่งไฟล์ Excel
        const excelPath = path.join(__dirname, `../../uploads/summaries/job_${jobId}_summary.xlsx`);
        await workbook.xlsx.writeFile(excelPath);

        res.download(excelPath, `สรุปผลการประเมิน_${job.title}.xlsx`, (err) => {
            if (err) {
                console.error('Error sending Excel file:', err);
                res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดาวน์โหลดไฟล์' });
            } else {
                fs.unlinkSync(excelPath);
            }
        });
    } catch (error) {
        console.error('Error generating Excel:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการสร้างไฟล์ Excel' });
    }
};
