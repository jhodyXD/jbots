const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const fs = require('fs');

// Inisialisasi bot Telegram dengan token
const token = '6942840133:AAFUiwpYIsRDoiPnkHUCHw6adegmurwqUbI'; // Ganti dengan token bot Anda
const bot = new TelegramBot(token, { polling: true });

// Fungsi untuk mengunduh video TikTok
async function downloadTikTokVideo(chatId, videoUrl) {
    try {
        // Kirim permintaan HTTP untuk mengunduh video
        const response = await axios.get(videoUrl, { responseType: 'stream' });

        // Simpan video ke file
        const fileName = 'tiktok_video.mp4';
        const writer = fs.createWriteStream(fileName);
        response.data.pipe(writer);

        writer.on('finish', () => {
            // Kirim video ke pengguna setelah selesai diunduh
            bot.sendVideo(chatId, fileName).then(() => {
                // Hapus file setelah dikirim
                fs.unlinkSync(fileName);
            });
        });

        writer.on('error', (err) => {
            console.error('Gagal menyimpan video:', err);
            bot.sendMessage(chatId, 'Gagal mengunduh video TikTok. Silakan coba lagi.');
        });
    } catch (error) {
        console.error('Gagal mengunduh video TikTok:', error.message);
        bot.sendMessage(chatId, 'Gagal mengunduh video TikTok. Periksa kembali URL yang Anda berikan.');
    }
}

// Event listener ketika bot menerima pesan
bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const messageText = msg.text;

    // Cek jika pesan berisi perintah /start
    if (messageText === '/start') {
        // Kirim pesan selamat datang dan deskripsi penggunaan bot
        const welcomeMessage = `
            Selamat datang di bot TikTok Downloader! 🎉
            
            Bot ini dibuat oleh Jhody Pedia.
            Kunjungi website kami untuk informasi lebih lanjut: [Tukukripto](https://tukukripto.my.id/)
            
            Untuk menggunakan bot ini, cukup kirimkan URL video TikTok yang ingin Anda unduh.
            Bot ini mendukung URL yang dimulai dengan:
            - https://www.tiktok.com/
            - https://vt.tiktok.com/
            - https://vm.tiktok.com/
            
            Kirimkan URL video TikTok dan saya akan mengunduhnya untuk Anda.
        `;
        bot.sendMessage(chatId, welcomeMessage, { parse_mode: 'Markdown' });
    } else if (messageText && (messageText.startsWith('https://www.tiktok.com/') || messageText.startsWith('https://vt.tiktok.com/') || messageText.startsWith('https://vm.tiktok.com/'))) {
        downloadTikTokVideo(chatId, messageText);
    } else {
        bot.sendMessage(chatId, 'Hanya tautan TikTok yang didukung. Silakan kirim tautan TikTok.');
    }
});
