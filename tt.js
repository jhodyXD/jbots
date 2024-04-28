const { Telegraf } = require('telegraf');
const Tiktok = require("@tobyg74/tiktok-api-dl");
const moment = require('moment-timezone');

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
        for (const url of tiktokUrls) {
            try {
                // Kirim pesan loading
                const loadingMessage = await ctx.reply('Sedang mengunduh video TikTok... ⏳');
                // Lakukan pemrosesan unduhan video TikTok untuk setiap URL yang ditemukan
                const videoLink = await downloadTikTokVideo(url);
                if (videoLink) {
                    // Hapus pesan loading
                    await ctx.telegram.deleteMessage(loadingMessage.chat.id, loadingMessage.message_id);
                    // Kirim video kepada pengguna
                    ctx.replyWithVideo({ source: videoLink });
                } else {
                    throw new Error('Tautan video tidak valid atau tidak ditemukan.');
                }
            } catch (error) {
                console.error('Gagal mengunduh video TikTok:', error.message);
                // Kirim pesan error kepada pengguna dalam bentuk teks
                ctx.reply('Gagal mengunduh video TikTok. Mohon coba lagi.');
            }
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

// Fungsi untuk mengunduh video TikTok menggunakan @tobyg74/tiktok-api-dl
async function downloadTikTokVideo(url) {
    try {
        const result = await Tiktok.Downloader(url, { version: "v1" });
        if (result && result.video) {
            return result.video;
        } else {
            throw new Error('Tautan video tidak valid atau tidak ditemukan.');
        }
    } catch (error) {
        console.error('Gagal mengunduh video TikTok:', error.message);
        throw new Error('Gagal mengunduh video TikTok. Silakan coba lagi.');
    }
}

// Jalankan bot
bot.launch();
