import nodemailer from 'nodemailer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootPath = path.join(__dirname, '../../../');


// ฟังก์ชันสำหรับส่งอีเมลรีเซ็ตรหัสผ่าน
export const sendResetPasswordEmail = async ({ email, first_name, resetToken }) => {
    try {
        let testAccount = await nodemailer.createTestAccount();

        const transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass
            }
        });

        // ส่งลิงก์ไปที่ frontend โดยตรง
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
        const mailOptions = {
            from: '"ระบบรับสมัครงาน" <noreply@parttime.com>',
            to: email,
            subject: 'รีเซ็ตรหัสผ่าน',
            html: `
                <div style="font-family: 'Sarabun', sans-serif; max-width: 600px; margin: 0 auto;">
                    <h1>รีเซ็ตรหัสผ่าน</h1>
                    <p>เรียน ${first_name},</p>
                    <p>กรุณาคลิกที่ปุ่มด้านล่างเพื่อรีเซ็ตรหัสผ่าน:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetUrl}" 
                           style="background-color: #4CAF50; 
                                  color: white; 
                                  padding: 14px 28px; 
                                  text-decoration: none; 
                                  border-radius: 5px;
                                  font-size: 16px;">
                            รีเซ็ตรหัสผ่าน
                        </a>
                    </div>
                    <p>หรือคัดลอกลิงก์นี้ไปวางในเบราว์เซอร์:</p>
                    <p style="background-color: #f5f5f5; 
                              padding: 10px; 
                              border-radius: 5px; 
                              word-break: break-all;">
                        ${resetUrl}
                    </p>
                    <p>ลิงก์นี้จะหมดอายุใน 24 ชั่วโมง</p>
                    <p>หากคุณไม่ได้ขอรีเซ็ตรหัสผ่าน กรุณาละเว้นอีเมลนี้</p>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Preview URL:', nodemailer.getTestMessageUrl(info));

        return {
            previewUrl: nodemailer.getTestMessageUrl(info),
            messageId: info.messageId
        };

    } catch (error) {
        console.error('Error sending reset password email:', error);
        throw new Error('ไม่สามารถส่งอีเมลรีเซ็ตรหัสผ่านได้');
    }
};



export const sendPaymentNotificationEmail = async (payment) => {

    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        let attachments = [];
        if (payment.payment_method === 'transfer' && payment.payment_slip) {
            const slipPath = path.join(rootPath, 'uploads', 'payment_slip', payment.payment_slip);
            if (fs.existsSync(slipPath)) {
                attachments.push({
                    filename: payment.payment_slip,
                    path: slipPath
                });
            } else {
                console.warn('Payment slip file not found:', slipPath);
            }
        }
        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to: payment.job_participation.user.email,
            subject: 'แจ้งการจ่ายเงิน',
            html: `
            <div style="font-family: 'Sarabun', sans-serif; max-width: 600px; margin: 0 auto;">
                <h1>แจ้งการจ่ายเงิน</h1>
                <p>เรียน ${payment.job_participation.user.first_name} ${payment.job_participation.user.last_name}</p>
                
                <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
                    <h2 style="margin-top: 0;">รายละเอียดการจ่ายเงิน</h2>
                    <p><strong>งาน:</strong> ${payment.job_participation.jobPosition.job.location}</p>
                    <p><strong>ตำแหน่ง:</strong> ${payment.job_participation.jobPosition.position_name}</p>
                    <p><strong>จำนวนเงิน:</strong> ${payment.amount.toLocaleString('th-TH')} บาท</p>
                    <p><strong>วิธีการจ่าย:</strong> ${payment.payment_method === 'cash' ? 'เงินสด' : 'โอนเงิน'
                }</p>
                    <p><strong>วันที่จ่าย:</strong> ${new Date(payment.paid_at).toLocaleDateString('th-TH', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                })}</p>
                    ${payment.payment_note ? `<p><strong>หมายเหตุ:</strong> ${payment.payment_note}</p>` : ''}
                </div>
                ${payment.payment_method === 'transfer' && payment.payment_slip ? `
                    <p>กรุณาดูไฟล์แนบสำหรับสลิปการโอนเงิน</p>
                ` : ''}
                <p>หากมีข้อสงสัยหรือต้องการสอบถามข้อมูลเพิ่มเติม กรุณาติดต่อเจ้าหน้าที่</p>
            </div>
        `,
            attachments: attachments
        };

        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully');
    } catch (error) {
        console.error('Error sending email:', error);
    }
};