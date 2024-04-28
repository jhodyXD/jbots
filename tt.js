const { Telegraf } = require('telegraf');
const fetch = require('node-fetch');
const fs = require('fs');
const { promisify } = require('util');
const { getIdVideo } = require('./tiktokHelper'); // Modul untuk mendapatkan ID video TikTok

const bot = new Telegraf('6942840133:AAFUiwpYIsRDoiPnkHUCHw6adegmurwqUbI');

// Fungsi untuk mengunduh video dari URL TikTok
const downloadVideo = async (videoUrl) => {
    const response = await fetch(videoUrl);
    const fileStream = fs.createWriteStream('downloaded_video.mp4');
    await new Promise((resolve, reject) => {
        response.body.pipe(fileStream);
        response.body.on('error', (err) => {
            reject(err);
        });
        fileStream.on('finish', function () {
            resolve();
        });
    });
};

// Handler untuk perintah /download
bot.command('download', async (ctx) => {
    const messageText = ctx.message.text;
    const videoUrl = messageText.split(' ')[1]; // Mengambil URL video dari pesan
    if (!videoUrl || !videoUrl.startsWith('https://www.tiktok.com/')) {
        ctx.reply('Mohon kirimkan URL video TikTok yang valid.');
        return;
    }
    try {
        const idVideo = await getIdVideo(videoUrl); // Mendapatkan ID video TikTok
        const videoDownloadUrl = `https://api.tiktok.com/video/download/?video_id=${idVideo}&iid=7318518857994389254&device_id=7318517321748022790&channel=googleplay&app_name=musical_ly&version_code=300904&device_platform=android&device_type=ASUS_Z01QD&version=9`; // URL unduhan video
        await downloadVideo(videoDownloadUrl); // Unduh video dari URL
        const videoStream = fs.createReadStream('downloaded_video.mp4'); // Buka file video yang diunduh
        await ctx.replyWithVideo({ source: videoStream }); // Kirim video ke pengguna
        // Hapus file video setelah dikirim
        const unlink = promisify(fs.unlink);
        await unlink('downloaded_video.mp4');
    } catch (error) {
        console.error('Error:', error);
        ctx.reply('Gagal mengunduh atau mengirim video.');
    }
});

// Jalankan bot
bot.launch();
