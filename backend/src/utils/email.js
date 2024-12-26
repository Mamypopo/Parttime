import nodemailer from 'nodemailer';

// ใช้จริง
export const sendVerificationEmail = async (user, token) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    // สร้าง verification URL 
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: user.email,
        subject: 'ยืนยันอีเมลของคุณ',
        html: `
            <div style="font-family: 'Sarabun', sans-serif; max-width: 600px; margin: 0 auto;">
                <h1>สวัสดี ${user.first_name} ${user.last_name}</h1>
                <p>กรุณายืนยันอีเมลโดยคลิกที่ปุ่มด้านล่าง:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${verificationUrl}" 
                       style="background-color: #4CAF50; 
                              color: white; 
                              padding: 14px 28px; 
                              text-decoration: none; 
                              border-radius: 5px;
                              font-size: 16px;">
                        ยืนยันอีเมล
                    </a>
                </div>
                <p>หรือคัดลอกลิงก์นี้ไปวางในเบราว์เซอร์:</p>
                <p style="background-color: #f5f5f5; 
                          padding: 10px; 
                          border-radius: 5px; 
                          word-break: break-all;">
                    ${verificationUrl}
                </p>
                <p>ลิงก์นี้จะหมดอายุใน 24 ชั่วโมง</p>
                <p>หากคุณไม่ได้ขอยืนยันอีเมล กรุณาละเว้นอีเมลนี้</p>
            </div>
        `
    };

    await transporter.sendMail(mailOptions);
};


// export const sendVerificationEmail = async (user, token) => {
//     // สร้างบัญชีชั่วคราวสำหรับทดสอบ
//     let testAccount = await nodemailer.createTestAccount();
//     console.log(testAccount);

//     const transporter = nodemailer.createTransport({
//         host: 'smtp.ethereal.email',
//         port: 587,
//         secure: false, // false สำหรับ STARTTLS (พอร์ต 587)
//         auth: {
//             user: testAccount.user,  // ใช้ username ที่สร้างจากบัญชีชั่วคราว
//             pass: testAccount.pass   // ใช้ password ที่สร้างจากบัญชีชั่วคราว
//         }
//     });

//     const mailOptions = {
//         from: '"YourApp" <noreply@yourapp.com>',
//         to: user.email,
//         subject: 'Verify your email address',
//         html: `
//       <h1>Hi ${user.first_name},</h1>
//       <p>Please verify your email by clicking the link below:</p>
//       <a href="http://localhost:8000/api/users/verify-email?token=${token}">Verify Email</a>
//     `
//     };

//     let info = await transporter.sendMail(mailOptions);
//     console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info)); // URL แสดงอีเมลที่ส่งไป
// };



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
        const resetUrl = `http://localhost:3000/reset-password?token=${resetToken}`;
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



// ฟังก์ชันสำหรับส่งอีเมลแจ้งเตือนการจ่ายเงิน
export const sendPaymentNotificationEmail = async (payment) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    // สร้าง HTML สำหรับแสดงรายละเอียดการจ่ายเงิน
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
                    <p><strong>งาน:</strong> ${payment.job_participation.jobPosition.job.title}</p>
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
                    <div style="text-align: center; margin: 20px 0;">
                        <p><strong>สลิปการโอนเงิน</strong></p>
                        <img src="${process.env.BACKEND_URL}/${payment.payment_slip}" 
                             alt="สลิปการโอนเงิน"
                             style="max-width: 100%; height: auto; border-radius: 5px;">
                    </div>
                ` : ''}

                <p>หากมีข้อสงสัยหรือต้องการสอบถามข้อมูลเพิ่มเติม กรุณาติดต่อเจ้าหน้าที่</p>
            </div>
        `
    };

    await transporter.sendMail(mailOptions);
};