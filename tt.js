const express = require('express');
const https = require('https');
const fs = require('fs');
const { Telegraf } = require('telegraf');
const fetch = require('node-fetch');
const bodyParser = require('body-parser');

const app = express();
const bot = new Telegraf('6942840133:AAFUiwpYIsRDoiPnkHUCHw6adegmurwqUbI');

app.use(bodyParser.json());

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
        const filePath = await downloadVideo(videoUrl);
        
        // Mengirim video yang berhasil diunduh ke bot Telegram
        const chatId = req.body.chatId; // Mendapatkan ID obrolan dari permintaan
        await bot.sendVideo(chatId, { source: filePath });

        res.send(`Video berhasil diunduh dan dikirimkan ke bot Telegram.`);
    } catch (error) {
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
