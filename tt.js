const express = require('express');
const fetch = require('node-fetch');
const bodyParser = require('body-parser');
const { Telegraf } = require('telegraf');
const firebase = require('./firebaseConfig'); // Import konfigurasi Firebase
const bot = require('./telegramConfig'); // Import konfigurasi bot Telegram
const app = express();
app.use(bodyParser.json());

// Fungsi untuk mendapatkan ID video dari URL TikTok
async function getIdVideo(url) {
    // Di sini Anda perlu mengimplementasikan logika untuk mendapatkan ID video dari URL TikTok
    // Misalnya, menggunakan ekspresi reguler atau parsing URL
    // Saya akan menyertakan contoh sederhana di sini
    const idVideo = url.split('/').pop(); // Ambil bagian terakhir dari URL sebagai ID video
    return idVideo;
}

// Fungsi untuk mengunduh video dari API TikTok
async function downloadVideoFromTikTok(idVideo) {
    try {
        // Membuat URL API TikTok dengan ID video
        const API_URL = `https://api22-normal-c-alisg.tiktokv.com/aweme/v1/feed/?aweme_id=${idVideo}&iid=7318518857994389254&device_id=7318517321748022790&channel=googleplay&app_name=musical_ly&version_code=300904&device_platform=android&device_type=ASUS_Z01QD&version=9`;

        // Melakukan permintaan ke API TikTok
        const response = await fetch(API_URL, {
            method: "GET",
            headers: {
                // Tambahkan header yang diperlukan di sini
            },
        });

        // Menangani respon dari API TikTok
        const data = await response.json();

        // Mengambil URL video dari respon
        const videoUrlFromAPI = data.videoUrl; // Ganti dengan kunci yang sesuai dari respon API TikTok
        return videoUrlFromAPI;
    } catch (error) {
        console.error('Gagal mengunduh video dari API TikTok:', error);
        throw new Error('Gagal mengunduh video dari API TikTok');
    }
}

// Fungsi untuk mengirim video ke bot Telegram
async function sendVideoToTelegram(chatId, videoUrl) {
    try {
        // Mengirim video ke bot Telegram
        await bot.telegram.sendVideo(chatId, videoUrl);
    } catch (error) {
        console.error('Gagal mengirim video ke bot Telegram:', error);
        throw new Error('Gagal mengirim video ke bot Telegram');
    }
}

// Endpoint untuk menerima permintaan unduhan video TikTok dari bot Telegram
app.post('/download', async (req, res) => {
    try {
        const videoUrl = req.body.videoUrl;
        const chatId = req.body.chatId;

        // Mendapatkan ID video dari URL TikTok
        const idVideo = await getIdVideo(videoUrl);

        // Mengunduh video dari API TikTok
        const videoUrlFromAPI = await downloadVideoFromTikTok(idVideo);

        // Mengirim video ke bot Telegram
        await sendVideoToTelegram(chatId, videoUrlFromAPI);

        res.sendStatus(200); // Mengirim status 200 OK tanpa pesan apapun
    } catch (error) {
        console.error('Gagal mengunduh dan mengirim video:', error);
        res.status(500).send('Gagal mengunduh dan mengirim video');
    }
});

// Middleware untuk menangani pesan yang diterima oleh bot Telegram
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

// Middleware untuk menangani perintah '/start' dari bot Telegram
bot.start((ctx) => ctx.reply('Selamat datang! Kirimkan URL video TikTok untuk mengunduh.'));

// Mulai bot Telegram
bot.launch();

// Mulai server backend
app.listen(3000, () => {
    console.log('Server backend berjalan di port 3000');
});
