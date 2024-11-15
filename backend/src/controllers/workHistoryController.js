import * as workHistoryModel from '../models/workHistoryModel.js';
import { createLog } from '../models/logModel.js';

export const getUserWorkHistory = async (req, res) => {
    const userId = parseInt(req.params.userId);

    try {
        // ตรวจสอบสิทธิ์ 
        if (req.user.role !== 'admin' && req.user.id !== userId) {
            return res.status(403).json({
                message: 'คุณไม่มีสิทธิ์ดูข้อมูลนี้'
            });
        }

        const workHistory = await workHistoryModel.getWorkHistoryByUserId(userId);

        await createLog(
            req.user.id,
            null,
            'View Work History',
            req.originalUrl,
            'GET',
            `User viewed work history. User ID: ${userId}`,
            req.ip,
            req.headers['user-agent']
        );

        res.status(200).json({
            message: 'ดึงข้อมูลประวัติการทำงานสำเร็จ',
            data: workHistory
        });

    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการดึงประวัติการทำงาน:', error);

        await createLog(
            req.user.id,
            null,
            'View Work History Error',
            req.originalUrl,
            'GET',
            `Error viewing work history: ${error.message}`,
            req.ip,
            req.headers['user-agent']
        );

        res.status(500).json({
            message: 'เกิดข้อผิดพลาดในการดึงประวัติการทำงาน',
            error: error.message
        });
    }
};

export const getWorkHistoryByParticipationId = async (req, res) => {
    const jobParticipationId = parseInt(req.params.participationId);

    try {
        const workHistory = await workHistoryModel.findByJobParticipationId(jobParticipationId);

        if (!workHistory) {
            return res.status(404).json({
                message: 'ไม่พบประวัติการทำงานนี้'
            });
        }

        // ตรวจสอบสิทธิ์
        if (req.user.role !== 'admin' && req.user.id !== workHistory.jobParticipation.user_id) {
            return res.status(403).json({
                message: 'คุณไม่มีสิทธิ์ดูข้อมูลนี้'
            });
        }

        await createLog(
            req.user.id,
            null,
            'View Work History Detail',
            req.originalUrl,
            'GET',
            `User viewed work history detail. Participation ID: ${jobParticipationId}`,
            req.ip,
            req.headers['user-agent']
        );

        res.status(200).json({
            message: 'ดึงข้อมูลประวัติการทำงานสำเร็จ',
            data: workHistory
        });

    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการดึงประวัติการทำงาน:', error);

        await createLog(
            req.user.id,
            null,
            'View Work History Detail Error',
            req.originalUrl,
            'GET',
            `Error viewing work history detail: ${error.message}`,
            req.ip,
            req.headers['user-agent']
        );

        res.status(500).json({
            message: 'เกิดข้อผิดพลาดในการดึงประวัติการทำงาน',
            error: error.message
        });
    }
};