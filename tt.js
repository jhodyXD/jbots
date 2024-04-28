const { Telegraf } = require('telegraf');
const axios = require('axios');
const fs = require('fs');

// Token bot Telegram
const BOT_TOKEN = '6942840133:AAFUiwpYIsRDoiPnkHUCHw6adegmurwqUbI';

// Token RapidAPI
const RAPIDAPI_KEY = '957db2fc94msh1788d44a1b2914ep1f1fc1jsna54f27aced3a';

// Inisialisasi bot Telegram
const bot = new Telegraf(BOT_TOKEN);

// Perintah /start
bot.start((ctx) => {
    ctx.reply(`Hello! I am TikTok Downloader Bot.\nI can download TikTok videos without Watermark.\n\n`
    + `Developer : @JayBeeDev\nLanguage : Node.js\nFramework : Telegraf`);
});

// Perintah /help
bot.help((ctx) => {
    ctx.reply(`Hello! I am TikTok Downloader Bot.\nI can download any TikTok video from a given link.\n\n`
    + `Send me a TikTok video link`);
});

// Tanggapan untuk setiap pesan yang berisi tautan TikTok
bot.on('text', async (ctx) => {
    const message = ctx.message.text;
    if (message.includes('tiktok') || message.includes('douyin')) {
        try {
            // Konfigurasi untuk mengakses API RapidAPI
            const options = {
                method: 'GET',
                url: 'https://tiktok-info.p.rapidapi.com/dl/',
                params: {
                    link: message
                },
                headers: {
                    'X-RapidAPI-Key': RAPIDAPI_KEY,
                    'X-RapidAPI-Host': 'tiktok-info.p.rapidapi.com'
                }
            };

            // Meminta tautan unduhan video TikTok
            const response = await axios.request(options);
            const downloadLink = response.data.videoLinks.download;

            // Mengunduh video
            const videoResponse = await axios.get(downloadLink, {
                responseType: 'stream'
            });

            // Menyimpan video ke dalam file
            const fileName = `video_${Date.now()}.mp4`;
            const filePath = `./${fileName}`;
            videoResponse.data.pipe(fs.createWriteStream(filePath));

            // Mengirim video ke Telegram
            ctx.replyWithVideo({
                source: filePath
            });

            // Menghapus file setelah dikirim
            fs.unlinkSync(filePath);
        } catch (error) {
            console.error(error);
            ctx.reply('Failed to download TikTok video.');
        }
    }
});

// Menjalankan bot
bot.launch();
