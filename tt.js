const express = require('express');
const https = require('https');
const fs = require('fs');
const { Telegraf } = require('telegraf');
const fetch = require('node-fetch');
const bodyParser = require('body-parser');

const app = express();
const bot = new Telegraf('YOUR_TELEGRAM_BOT_TOKEN');

// Middleware untuk mengurai body JSON dari permintaan HTTP
app.use(bodyParser.json());

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

// Endpoint untuk menerima permintaan unduhan video TikTok dari bot Telegram
app.post('/download', async (req, res) => {
    try {
        const videoUrl = req.body.videoUrl; // Mendapatkan URL video dari permintaan
        const filePath = await downloadVideo(videoUrl); // Mengunduh video dari URL
        res.send(`Video berhasil diunduh: ${filePath}`);
    } catch (error) {
        res.status(500).send('Gagal mengunduh video');
    }
});

// Inisialisasi bot Telegram
bot.start((ctx) => ctx.reply('Selamat datang! Kirimkan URL video TikTok untuk mengunduh.'));

// Mendengarkan pesan dari pengguna
bot.on('message', async (ctx) => {
    const messageText = ctx.message.text;
    if (messageText.startsWith('https://vt.tiktok.com/')) {
        try {
            // Mengirim permintaan unduhan video TikTok ke server backend
            const response = await fetch('http://localhost:3000/download', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ videoUrl: messageText }),
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

// Menjalankan server backend dan bot Telegram
app.listen(3000, () => {
    console.log('Server backend berjalan di port 3000');
    bot.launch();
});
