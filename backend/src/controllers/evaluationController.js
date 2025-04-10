
import * as evaluationModel from '../models/evaluationModel.js';
import * as workHistoryModel from '../models/workHistoryModel.js';

// ดึงข้อมูลการประเมินตาม ID
export const getEvaluationById = async (req, res) => {
    const { workHistoryId } = req.params;

    try {
        const workHistory = await workHistoryModel.getWorkHistoryById(parseInt(workHistoryId));

        if (!workHistory) {
            return res.status(404).json({ message: 'ไม่พบข้อมูลการประเมิน' });
        }

        res.json(workHistory);
    } catch (error) {
        console.error('Error fetching evaluation:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลการประเมิน' });
    }
};

// อัปเดตข้อมูลการประเมิน
export const updateEvaluation = async (req, res) => {
    const { workHistoryId } = req.params;
    const evaluationData = req.body;

    try {
        const existingWorkHistory = await workHistoryModel.getWorkHistoryById(parseInt(workHistoryId));

        if (!existingWorkHistory) {
            return res.status(404).json({ message: 'ไม่พบข้อมูลการประเมิน' });
        }

        // คำนวณคะแนนรวมใหม่
        if (evaluationData.is_passed_evaluation !== false) {
            const scores = [
                evaluationData.appearance_score !== undefined ? evaluationData.appearance_score : existingWorkHistory.appearance_score,
                evaluationData.quality_score !== undefined ? evaluationData.quality_score : existingWorkHistory.quality_score,
                evaluationData.quantity_score !== undefined ? evaluationData.quantity_score : existingWorkHistory.quantity_score,
                evaluationData.manner_score !== undefined ? evaluationData.manner_score : existingWorkHistory.manner_score,
                evaluationData.punctuality_score !== undefined ? evaluationData.punctuality_score : existingWorkHistory.punctuality_score
            ];

            // คำนวณคะแนนรวม
            evaluationData.total_score = scores.reduce((sum, score) => sum + (score || 0), 0);
        }

        // อัปเดตข้อมูล
        const updatedWorkHistory = await workHistoryModel.updateWorkHistory(parseInt(workHistoryId), evaluationData);

        res.json({
            message: 'อัปเดตข้อมูลการประเมินเรียบร้อยแล้ว',
            data: updatedWorkHistory
        });
    } catch (error) {
        console.error('Error updating evaluation:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการอัปเดตข้อมูลการประเมิน' });
    }
};
