const express = require('express');
const { Telegraf } = require('telegraf');
const fetch = require('node-fetch');

const app = express();
const bot = new Telegraf('6942840133:AAFUiwpYIsRDoiPnkHUCHw6adegmurwqUbI');

bot.start((ctx) => ctx.reply('Selamat datang! Kirimkan link TikTok untuk mengunduh.'));
bot.help((ctx) => ctx.reply('Kirimkan link TikTok untuk mengunduh.'));

bot.on('text', async (ctx) => {
    const messageText = ctx.message.text.trim();
    
    // Regex untuk mendeteksi link TikTok
    const tiktokRegex = /(vt|vm)\.tiktok\.com|www\.tiktok\.com/;
    
    if (tiktokRegex.test(messageText)) {
        // Kirim link ke API untuk pengunduhan
        try {
            const response = await fetch('https://tdl.besecure.eu.org/api/download', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    url: messageText,
                    nocache: true, // Sesuaikan sesuai kebutuhan
                    type: 'Provider', // Sesuaikan sesuai kebutuhan
                    rotateOnError: false, // Sesuaikan sesuai kebutuhan
                }),
            });
            const data = await response.json();
            // Tampilkan status pengunduhan
            ctx.reply(data.success ? 'Video berhasil diunduh!' : 'Gagal mengunduh video.');
        } catch (error) {
            console.error('Gagal mengirim permintaan unduhan:', error);
            ctx.reply('Gagal mengirim permintaan unduhan.');
        }
    } else {
        ctx.reply('Mohon kirimkan link TikTok yang valid.');
    }
});

bot.launch();

// Endpoint untuk menerima pesan dari pengguna
app.post('/telegram/message', (req, res) => {
    bot.handleUpdate(req.body);
    res.sendStatus(200);
});

// Port untuk server Express
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server Express berjalan di port ${PORT}`);
});
