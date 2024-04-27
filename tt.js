const express = require('express');
const fetch = require('node-fetch');
const bodyParser = require('body-parser');
const firebase = require('./firebaseConfig'); // Import konfigurasi Firebase
const bot = require('./telegramConfig'); // Import konfigurasi bot Telegram

const app = express();

app.use(bodyParser.json());

// Fungsi untuk mengunduh video dari Firebase Storage
async function downloadVideoFromStorage(fileUrl) {
    const bucket = firebase.storage().bucket();
    const file = bucket.file(fileUrl);

    // Mengambil URL unduhan berkas dari Firebase Storage
    const [url] = await file.getSignedUrl({ action: 'read', expires: '01-01-2500' });

    // Mengunduh berkas menggunakan URL unduhan
    const response = await fetch(url);
    const videoBuffer = await response.buffer();
    return videoBuffer;
}

// Fungsi untuk menghapus pesan
async function deleteMessage(chatId, messageId) {
    try {
        await bot.telegram.deleteMessage(chatId, messageId);
    } catch (error) {
        console.error('Gagal menghapus pesan:', error);
    }
}

app.post('/download', async (req, res) => {
    try {
        const videoUrl = req.body.videoUrl;
        const chatId = req.body.chatId;
        const messageId = req.body.messageId; // Ambil ID pesan dari permintaan

        // Mengunduh video dari Firebase Storage
        const videoBuffer = await downloadVideoFromStorage(videoUrl);

        // Mengirim video ke bot Telegram
        const sentMessage = await bot.telegram.sendVideo(chatId, { source: videoBuffer });

        // Menghapus pesan yang terkirim
        await deleteMessage(chatId, messageId);

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
    const messageId = ctx.message.message_id; // Ambil ID pesan dari pesan yang diterima
    
    if (messageText.startsWith('https://vt.tiktok.com/')) {
        try {
            const response = await fetch('http://localhost:3000/download', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ videoUrl: messageText, chatId: chatId, messageId: messageId }), // Sertakan ID pesan dalam permintaan
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
