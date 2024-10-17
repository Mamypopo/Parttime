import { WebSocketServer } from 'ws';

// เก็บสถานะการเชื่อมต่อของ admin และ user
let adminSockets = [];
let userSockets = {};

// สร้างฟังก์ชันเพื่อเซ็ตอัพ WebSocket Server
export const setupWebSocketServer = (server) => {
    const wss = new WebSocketServer({ server }); // ผูก WebSocket กับ HTTP server ที่มีอยู่

    wss.on('connection', (ws, req) => {
        // ดึงข้อมูล query string เช่น ?role=admin หรือ ?role=user
        const urlParams = new URLSearchParams(req.url.replace('/', ''));
        const role = urlParams.get('role');
        const userId = urlParams.get('userId');

        if (role === 'admin') {
            console.log('Admin connected');
            ws.send('Welcome admin');
        } else if (role === 'user' && userId) {
            console.log(`User ${userId} connected`);
            ws.send(`Welcome user ${userId}`);
        }

        ws.on('message', (message) => {
            const decodedMessage = message.toString();
            console.log('Received:', decodedMessage);
        });

        ws.on('close', () => {
            console.log('Connection closed');
        });
    });
};
export const notifyAdmins = (message) => {
    console.log("Sending notification to admins:", message);
    adminSockets.forEach((socket) => {
        if (socket.readyState === WebSocket.OPEN) { // ตรวจสอบว่า WebSocket ยังเปิดอยู่
            socket.send(JSON.stringify(message)); // ส่งข้อความแจ้งเตือน
            console.log("Message sent to admin");
        } else {
            console.log("Socket is not open, cannot send message");
        }
    });
};
// ฟังก์ชันส่งการแจ้งเตือนไปยังผู้ใช้ตาม userId
export const notifyUser = (userId, message) => {
    const userSocket = userSockets[userId];
    if (userSocket && userSocket.readyState === WebSocket.OPEN) {
        userSocket.send(message);
    }
};
