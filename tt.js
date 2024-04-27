const express = require('express');
const https = require('https');
const fs = require('fs');
const { Telegraf } = require('telegraf');
const fetch = require('node-fetch');
const admin = require('firebase-admin');
const bodyParser = require('body-parser');

const app = express();
const bot = new Telegraf('6942840133:AAFUiwpYIsRDoiPnkHUCHw6adegmurwqUbI');

app.use(bodyParser.json());

// Inisialisasi Firebase Admin SDK
const serviceAccount = require('jbots-8c508-firebase-adminsdk-zwj8j-73a7412c3f.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: 'jbots-8c508.appspot.com'
});

// Fungsi untuk mengunggah file ke Firebase Storage
async function uploadToFirebaseStorage(filePath, fileName) {
    const bucket = admin.storage().bucket();
    const file = bucket.file(fileName);

    await file.save(fs.createReadStream(filePath), {
        contentType: 'video/mp4',
        public: true
    });

    const [url] = await file.getSignedUrl({ action: 'read', expires: '01-01-2500' });
    return url;
}

// Fungsi untuk mengunduh video dari URL TikTok
function downloadVideo(videoUrl) {
    return new Promise((resolve, reject) => {
        https.get(videoUrl, (response) => {
            const filename = `src/${generateRandomString()}.mp4`;
            const fileStream = fs.createWriteStream(filename);
            response.pipe(fileStream);
            fileStream.on('finish', () => {
                fileStream.close(() => resolve(filename));
            });
        }).on('error', (err) => {
            reject(err);
        });
    });
}

// Fungsi untuk menghasilkan string acak
function generateRandomString(length = 10) {
    const characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let randomString = '';
    for (let i = 0; i < length; i++) {
        randomString += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return randomString;
}

app.post('/download', async (req, res) => {
    try {
        const videoUrl = req.body.videoUrl;
        const chatId = req.body.chatId;
        const filePath = await downloadVideo(videoUrl);
        
        // Mengunggah video ke Firebase Storage
        const uploadedUrl = await uploadToFirebaseStorage(filePath, generateRandomString() + '.mp4');

        // Mengirim URL video yang berhasil diunggah ke bot Telegram
        await bot.sendMessage(chatId, `Video berhasil diunduh:\n${uploadedUrl}`);

        // Menghapus file setelah berhasil mengirimkan tautan
        fs.unlinkSync(filePath);

        res.send(`Video berhasil diunduh dan tautan telah dikirimkan ke bot Telegram.`);
    } catch (error) {
        console.error('Gagal mengunduh dan mengirimkan video:', error);
        res.status(500).send('Gagal mengunduh dan mengirimkan video');
    }
});

bot.start((ctx) => ctx.reply('Selamat datang! Kirimkan URL video TikTok untuk mengunduh.'));

bot.on('message', async (ctx) => {
    const messageText = ctx.message.text;
    const chatId = ctx.chat.id;
    
    if (messageText.startsWith('https://vt.tiktok.com/')) {
        try {
            const response = await fetch('http://localhost:3000/download', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ videoUrl: messageText, chatId: chatId }),
            });
            const result = await response.text();
            ctx.reply(result);
        } catch (error) {
            console.error('Gagal mengirim permintaan unduhan:', error);
            ctx.reply('Gagal mengirim permintaan unduhan');
        }
    } else {
        ctx.reply('Mohon kirimkan URL video TikTok yang valid.');
    }
});

app.listen(3000, () => {
    console.log('Server backend berjalan di port 3000');
    bot.launch();
});
