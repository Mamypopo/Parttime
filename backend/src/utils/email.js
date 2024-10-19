import nodemailer from 'nodemailer';

// ใช้จริง
// export const sendVerificationEmail = async (user, token) => {
//     const transporter = nodemailer.createTransport({
//         service: 'gmail',  // หรือ SMTP provider อื่น ๆ ที่คุณต้องการใช้
//         auth: {
//             user: process.env.EMAIL_USER,   // เก็บข้อมูลอีเมลผู้ส่งใน .env
//             pass: process.env.EMAIL_PASS    // เก็บข้อมูลรหัสผ่านใน .env (ใช้ App Password ถ้าเป็น Gmail)
//         }
//     });

//     const mailOptions = {
//         from: '"YourApp" <noreply@yourapp.com>',
//         to: user.email,
//         subject: 'Verify your email address',
//         html: `
//       <h1>Hi ${user.first_name},</h1>
//       <p>Please verify your email by clicking the link below:</p>
//       <a href="http://yourproductiondomain.com/api/users/verify-email?token=${token}">Verify Email</a>
//     `
//     };

//     await transporter.sendMail(mailOptions);
// };


export const sendVerificationEmail = async (user, token) => {
    // สร้างบัญชีชั่วคราวสำหรับทดสอบ
    let testAccount = await nodemailer.createTestAccount();
    console.log(testAccount);  // พิมพ์ข้อมูลบัญชีชั่วคราวออกมาเพื่อให้คุณตรวจสอบ

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