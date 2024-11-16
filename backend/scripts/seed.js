import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

const USERS_TO_CREATE = 50;

// ตัวละครจากการ์ตูน
const characters = [
    // Naruto
    { firstName: "นารูโตะ", lastName: "อุซึมากิ", gender: "male", profileImage: "naruto.jpg" },
    { firstName: "ซากุระ", lastName: "ฮารุโนะ", gender: "female", profileImage: "sakura.jpg" },
    { firstName: "ซาสึเกะ", lastName: "อุจิวะ", gender: "male", profileImage: "sasuke.jpg" },
    { firstName: "ฮินาตะ", lastName: "ฮิวงะ", gender: "female", profileImage: "hinata.jpg" },
    { firstName: "คาคาชิ", lastName: "ฮาตาเกะ", gender: "male", profileImage: "kakashi.jpg" },

    // One Piece
    { firstName: "ลูฟี่", lastName: "มังกี้ดี", gender: "male", profileImage: "luffy.jpg" },
    { firstName: "โซโร", lastName: "โรโรโนอา", gender: "male", profileImage: "zoro.jpg" },
    { firstName: "นามิ", lastName: "", gender: "female", profileImage: "nami.jpg" },
    { firstName: "ซันจิ", lastName: "", gender: "male", profileImage: "sanji.jpg" },
    { firstName: "โรบิน", lastName: "นิโค", gender: "female", profileImage: "robin.jpg" },

    // Demon Slayer
    { firstName: "ทันจิโร่", lastName: "คามาโดะ", gender: "male", profileImage: "tanjiro.jpg" },
    { firstName: "เนซึโกะ", lastName: "คามาโดะ", gender: "female", profileImage: "nezuko.jpg" },
    { firstName: "อิโนะสุเกะ", lastName: "ฮาชิบิระ", gender: "male", profileImage: "inosuke.jpg" },
    { firstName: "เซนอิทซึ", lastName: "อากาสึมะ", gender: "male", profileImage: "zenitsu.jpg" },
    { firstName: "ชิโนบุ", lastName: "โคโช", gender: "female", profileImage: "shinobu.jpg" },


    // เกิดใหม่ทั้งทีเป็นสไลม์ไปซะแล้ว
    { firstName: "ริมุรุ", lastName: "เทมเพสต์", gender: "male", profileImage: "rimuru.jpg" },
    { firstName: "ชิซุ", lastName: "อิซาวะ", gender: "female", profileImage: "shizu.jpg" },
    { firstName: "มิลิม", lastName: "นาวา", gender: "female", profileImage: "milim.jpg" },
    { firstName: "เบนิมารุ", lastName: "", gender: "male", profileImage: "benimaru.jpg" },
    { firstName: "โชอุ", lastName: "", gender: "male", profileImage: "shou.jpg" },
    { firstName: "ฮาคุโร่", lastName: "", gender: "male", profileImage: "hakuro.jpg" },
    { firstName: "ชูนะ", lastName: "", gender: "female", profileImage: "shuna.jpg" },
    { firstName: "ดิโอ", lastName: "", gender: "male", profileImage: "diablo.jpg" },
    { firstName: "กาบิรุ", lastName: "", gender: "male", profileImage: "gabiru.jpg" },
    { firstName: "เทสต้า", lastName: "", gender: "female", profileImage: "testarossa.jpg" },

];

// สกิลที่ใช้สุ่ม
const skills = ["X-ray", "Nurse", "Medic", "Register", "Ear exam", "Blood test", "Blowing lungs"];

// ฟังก์ชันสุ่มสกิล
function getRandomSkills() {
    return skills
        .sort(() => Math.random() - 0.5) // สุ่มเรียงลำดับ
        .slice(0, Math.floor(Math.random() * skills.length) + 1); // เลือกจำนวนสุ่ม
}

async function generateUsers() {
    console.log("กำลังสร้างข้อมูลผู้ใช้...");

    for (let i = 0; i < USERS_TO_CREATE; i++) {
        const char = characters[i % characters.length]; // ใช้ตัวละครวนซ้ำ
        const birthDate = new Date(
            1990 + Math.floor(Math.random() * 20), // สุ่มปีเกิดระหว่าง 1990-2010
            Math.floor(Math.random() * 12), // สุ่มเดือน
            Math.floor(Math.random() * 28) + 1 // สุ่มวัน
        );

        await prisma.user.create({
            data: {
                email: `user${i + 1}@gmail.com`,
                password: await bcrypt.hash("1234", 10),
                prefix: char.gender === "male" ? "นาย" : "นางสาว",
                first_name: char.firstName,
                last_name: char.lastName || "ไม่มีนามสกุล",
                national_id: String(Math.floor(1000000000000 + Math.random() * 8999999999999)), // สุ่มเลข 13 หลัก
                gender: char.gender === "male" ? "ชาย" : "หญิง",
                birth_date: birthDate,
                age: new Date().getFullYear() - birthDate.getFullYear(),
                education_certificate: `certificate-${i + 1}.pdf`,
                phone_number: `08123456${(i % 100).toString().padStart(2, "0")}`,
                line_id: `LINE${i + 1}`,
                profile_image: char.profileImage,
                skills: JSON.stringify(getRandomSkills()),
                role: "user",
                user_documents: `document-${i + 1}.pdf`,
                created_at: new Date(),
                updated_at: new Date(),
            },
        });
    }

    console.log(`สร้างผู้ใช้ ${USERS_TO_CREATE} คนเสร็จสิ้น`);
}

async function clearDatabase() {
    console.log("ลบข้อมูลเก่าทั้งหมด...");
    await prisma.user.deleteMany({});
    console.log("ลบข้อมูลเก่าทั้งหมดเสร็จสิ้น");
}

async function main() {
    try {
        await clearDatabase();
        await generateUsers();
        console.log("สร้างข้อมูลจำลองทั้งหมดเสร็จสิ้น");
    } catch (error) {
        console.error("เกิดข้อผิดพลาด:", error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
