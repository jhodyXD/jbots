const express = require('express');
const https = require('https');
const { Telegraf } = require('telegraf');
const fetch = require('node-fetch');
const admin = require('firebase-admin');
const bodyParser = require('body-parser');

const app = express();
const bot = new Telegraf('6942840133:AAFUiwpYIsRDoiPnkHUCHw6adegmurwqUbI');

app.use(bodyParser.json());

// Inisialisasi Firebase Admin SDK
const serviceAccount = require('./myAcc.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: 'gs://jbots-8c508.appspot.com'
});

// Fungsi untuk mengunggah file ke Firebase Storage
async function uploadToFirebaseStorage(videoUrl) {
    const bucket = admin.storage().bucket();
    const filename = `videos/${generateRandomString()}.mp4`;
    const file = bucket.file(filename);

    return new Promise((resolve, reject) => {
        https.get(videoUrl, (response) => {
            const writeStream = file.createWriteStream({
                metadata: {
                    contentType: 'video/mp4'
                }
            });
            response.pipe(writeStream);
            writeStream.on('finish', () => {
                resolve(`https://storage.googleapis.com/${bucket.name}/${filename}`);
            });
            writeStream.on('error', (error) => {
                reject(error);
            });
        }).on('error', (error) => {
            reject(error);
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

        // Mengunggah video ke Firebase Storage
        const uploadedUrl = await uploadToFirebaseStorage(videoUrl);

        // Mengirim URL video ke bot Telegram
        bot.telegram.sendVideo(chatId, { source: uploadedUrl });

        res.sendStatus(200); // Mengirim status 200 OK tanpa pesan apapun
    } catch (error) {
        console.error('Gagal mengunduh dan mengirim video:', error);
        res.status(500).send('Gagal mengunduh dan mengirim video');
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
            ctx.reply('Video sedang diproses...');
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
