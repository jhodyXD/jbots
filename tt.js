const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

// Inisialisasi bot Telegram dengan token
const token = '6942840133:AAFUiwpYIsRDoiPnkHUCHw6adegmurwqUbI'; // Ganti dengan token bot Anda
const bot = new TelegramBot(token, { polling: true });

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

// Event listener ketika bot menerima pesan
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const messageText = msg.text;

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
        bot.sendMessage(chatId, welcomeMessage);
    } else if (messageText && (messageText.startsWith('https://www.tiktok.com/') || messageText.startsWith('https://vt.tiktok.com/') || messageText.startsWith('https://vm.tiktok.com/'))) {
        try {
            // Dapatkan tautan video TikTok
            const videoLink = await getTikTokVideoInfo(messageText);

            // Kirim tautan video ke pengguna
            bot.sendMessage(chatId, videoLink);
        } catch (error) {
            console.error('Gagal mengirim tautan video TikTok:', error.message);
            bot.sendMessage(chatId, 'Gagal mengirim tautan video TikTok. Periksa kembali URL yang Anda berikan.');
        }
    } else {
        // Tanggapi jika pesan tidak berisi tautan TikTok atau perintah /start
        const errorMessage = `
            Maaf, saya hanya dapat mengirimkan tautan video TikTok.
            Kirimkan URL video TikTok yang ingin Anda unduh atau gunakan perintah /start untuk informasi lebih lanjut.
        `;
        bot.sendMessage(chatId, errorMessage);
    }
});
