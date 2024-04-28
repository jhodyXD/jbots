const { Telegraf } = require('telegraf');
const moment = require('moment-timezone');
const axios = require('axios');

// Inisialisasi bot Telegram dengan token
const token = '6942840133:AAFUiwpYIsRDoiPnkHUCHw6adegmurwqUbI'; // Ganti dengan token bot Anda
const bot = new Telegraf(token);

// Middleware untuk menangani perintah /start
bot.start((ctx) => {
    // Kirim pesan selamat datang dan deskripsi penggunaan bot
    const welcomeMessage = `
        Selamat datang di bot TikTok Downloader! 🎉
        
        Anda dapat mengirimkan URL video TikTok, dan saya akan mencoba untuk mengunduhnya untuk Anda.
        
        Bot dibuat oleh Jhody Pedia.
        ${getFormattedTime()}
    `;
    ctx.reply(welcomeMessage);
});

// Middleware untuk menangani pesan teks
bot.on('text', async (ctx) => {
    const messageText = ctx.message.text;
    const tiktokUrls = extractTikTokUrls(messageText);
    
    if (tiktokUrls.length === 0) {
        ctx.reply('Tidak ada URL video TikTok yang ditemukan dalam pesan Anda.');
    } else {
        try {
            for (const url of tiktokUrls) {
                // Lakukan pemrosesan unduhan video TikTok untuk setiap URL yang ditemukan
                const videoLink = url; // Ganti dengan pemrosesan unduhan yang sesuai
                ctx.reply(videoLink);
            }
        } catch (error) {
            console.error('Gagal mengunduh video TikTok:', error.message);
            ctx.reply('Gagal mengunduh video TikTok. Mohon coba lagi.');
        }
    }
});

// Fungsi untuk mendapatkan waktu terformat di zona Asia/Jakarta
function getFormattedTime() {
    return moment.tz('Asia/Jakarta').format('DD-MM-YYYY HH:mm:ss');
}

// Fungsi untuk mengekstrak URL TikTok dari teks
function extractTikTokUrls(text) {
    const urlRegex = /(https?:\/\/(?:www\.)?(?:vt|vm|www)\.tiktok\.com\/[\w-]+)/gi;
    return text.match(urlRegex) || [];
}

// Jalankan bot
bot.launch();
