import api from './axios.js'

export default {
    // ดึงข้อมูลการประเมินตาม ID
    getEvaluationById(workHistoryId) {
        return api.get(`/api/work-history/${workHistoryId}`);
    },

    // อัปเดตข้อมูลการประเมิน
    updateEvaluation(workHistoryId, data) {
        return api.put(`/api/work-history/${workHistoryId}`, data);
    }
}