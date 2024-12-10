import nodemailer from 'nodemailer';

// ใช้จริง
// export const sendVerificationEmail = async (user, token) => {
//     const transporter = nodemailer.createTransport({
//         service: 'gmail',
//         auth: {
//             user: process.env.EMAIL_USER,
//             pass: process.env.EMAIL_PASS
//         }
//     });

//     const mailOptions = {
//         from: process.env.EMAIL_FROM,
//         to: user.email,
//         subject: 'ยืนยันอีเมลของคุณ',
//         html: `
//       <h1>สวัสดี ${user.first_name},</h1>
//       <p>กรุณายืนยันอีเมลโดยคลิกที่ลิงก์ด้านล่าง:</p>
//       <a href="${process.env.FRONTEND_URL}/verify-email?token=${token}">ยืนยันอีเมล</a>
//     `
//     };

//     await transporter.sendMail(mailOptions);
// };


export const sendVerificationEmail = async (user, token) => {
    // สร้างบัญชีชั่วคราวสำหรับทดสอบ
    let testAccount = await nodemailer.createTestAccount();
    console.log(testAccount);

    const transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false, // false สำหรับ STARTTLS (พอร์ต 587)
        auth: {
            user: testAccount.user,  // ใช้ username ที่สร้างจากบัญชีชั่วคราว
            pass: testAccount.pass   // ใช้ password ที่สร้างจากบัญชีชั่วคราว
        }
    });

    const mailOptions = {
        from: '"YourApp" <noreply@yourapp.com>',
        to: user.email,
        subject: 'Verify your email address',
        html: `
      <h1>Hi ${user.first_name},</h1>
      <p>Please verify your email by clicking the link below:</p>
      <a href="http://localhost:8000/api/users/verify-email?token=${token}">Verify Email</a>
    `
    };

    let info = await transporter.sendMail(mailOptions);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info)); // URL แสดงอีเมลที่ส่งไป
};



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