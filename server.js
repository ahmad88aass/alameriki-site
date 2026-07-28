require('dotenv').config();
const express = require('express');
const TelegramBotPackage = require('node-telegram-bot-api');
const cors = require('cors');

// حل مشكلة الـ Constructor لتوافق جميع إصدارات المكتبة
const TelegramBot = TelegramBotPackage.default || TelegramBotPackage;

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const BOT_TOKEN = process.env.BOT_TOKEN;
const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID;
const PORT = process.env.PORT || 3000;

const bot = new TelegramBot(BOT_TOKEN, { polling: true });
const activeOrders = {};

console.log("جارٍ تشغيل سيرفر 'الأمريكي' وبوت التلغرام...");

app.post('/api/buy-number', (req, res) => {
    const { service, phone } = req.body;
    const orderId = 'ORD-' + Math.floor(100000 + Math.random() * 900000);

    activeOrders[orderId] = {
        service: service || 'خدمة عامة',
        phone: phone || 'غير محدد',
        status: 'PENDING',
        code: null,
        res: res
    };

    const message = "طلب رقم جديد!\n\n" +
                    "الخدمة: " + service + "\n" +
                    "الرقم المطلوب: " + phone + "\n" +
                    "رقم الطلب: " + orderId + "\n\n" +
                    "لإرسال الكود للزبون اكتب:\n" +
                    "code " + orderId + " 123456";

    bot.sendMessage(ADMIN_CHAT_ID, message);
});

bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    if (chatId.toString() !== ADMIN_CHAT_ID.toString()) return;

    const text = msg.text ? msg.text.trim() : '';

    if (text.startsWith('code ')) {
        const parts = text.split(' ');
        if (parts.length >= 3) {
            const orderId = parts[1];
            const code = parts[2];

            if (activeOrders[orderId]) {
                const order = activeOrders[orderId];
                order.status = 'COMPLETED';
                order.code = code;

                order.res.json({ success: true, code: code, message: 'تم إرسال الكود بنجاح' });
                delete activeOrders[orderId];

                bot.sendMessage(ADMIN_CHAT_ID, "تم إرسال الكود " + code + " للطلب " + orderId + " بنجاح!");
            } else {
                bot.sendMessage(ADMIN_CHAT_ID, "رقم الطلب " + orderId + " غير موجود أو انتهت صلاحيته.");
            }
        }
    }
});

app.listen(PORT, () => {
    console.log("🚀 السيرفر يعمل الآن على الرابط: http://localhost:" + PORT);
});
