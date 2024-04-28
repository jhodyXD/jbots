const { Telegraf } = require('telegraf');
const axios = require('axios');

// Inisialisasi bot Telegram dengan token
const token = '6942840133:AAFUiwpYIsRDoiPnkHUCHw6adegmurwqUbI'; // Ganti dengan token bot Anda
const bot = new Telegraf(token);

// Fungsi untuk mengambil informasi video TikTok dari URL
async function getTikTokVideoInfo(videoUrl) {
    try {
        // Kirim permintaan HTTP untuk mendapatkan informasi video TikTok
        const response = await axios.get(`https://www.tiktok.com/oembed?url=${encodeURIComponent(videoUrl)}`);

        // Ambil tautan video dari respons
        const videoLink = response.data.video_url;
        return videoLink;
    } catch (error) {
        console.error('Gagal mendapatkan informasi video TikTok:', error.message);
        throw new Error('Gagal mendapatkan informasi video TikTok. Periksa kembali URL yang Anda berikan.');
    }
}

// Middleware untuk menangani pesan teks
bot.on('text', async (ctx) => {
    const messageText = ctx.message.text;
    const chatId = ctx.chat.id;

    // Cek jika pesan berisi perintah /start
    if (messageText === '/start') {
        // Kirim pesan selamat datang dan deskripsi penggunaan bot
        const welcomeMessage = `
            Selamat datang di bot TikTok Downloader! 🎉
            
            Untuk menggunakan bot ini, cukup kirimkan URL video TikTok yang ingin Anda unduh.
            Bot ini mendukung URL yang dimulai dengan:
            - https://www.tiktok.com/
            - https://vt.tiktok.com/
            - https://vm.tiktok.com/
            
            Kirimkan URL video TikTok dan saya akan memberikan tautan untuk mengunduhnya.
        `;
        ctx.reply(welcomeMessage);
    } else if (messageText.startsWith('https://www.tiktok.com/') || messageText.startsWith('https://vt.tiktok.com/') || messageText.startsWith('https://vm.tiktok.com/')) {
        try {
            // Dapatkan tautan video TikTok
            const videoLink = await getTikTokVideoInfo(messageText);

            // Kirim tautan video ke pengguna
            ctx.reply(videoLink);
        } catch (error) {
            console.error('Gagal mengirim tautan video TikTok:', error.message);
            ctx.reply('Gagal mengirim tautan video TikTok. Periksa kembali URL yang Anda berikan.');
        }
    } else {
        // Tanggapi jika pesan tidak berisi tautan TikTok atau perintah /start
        const errorMessage = `
            Maaf, saya hanya dapat mengirimkan tautan video TikTok.
            Kirimkan URL video TikTok yang ingin Anda unduh atau gunakan perintah /start untuk informasi lebih lanjut.
        `;
        ctx.reply(errorMessage);
    }
});

// Mulai bot
bot.launch();
