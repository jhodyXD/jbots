const { Telegraf } = require('telegraf');
const axios = require('axios');

// Fungsi untuk mendapatkan URL video TikTok menggunakan API
async function getTikTokVideoUrl(url) {
  const options = {
    method: 'GET',
    url: 'https://tiktok-info.p.rapidapi.com/dl/',
    params: {
      link: url
    },
    headers: {
      'X-RapidAPI-Key': '957db2fc94msh1788d44a1b2914ep1f1fc1jsna54f27aced3a',
      'X-RapidAPI-Host': 'tiktok-info.p.rapidapi.com'
    }
  };

  try {
    const response = await axios.request(options);
    return response.data;
  } catch (error) {
    console.error(error);
    throw new Error('Failed to fetch TikTok video URL');
  }
}

// Fungsi untuk mendapatkan deskripsi dan author
function getStartMessage() {
  return `Halo! Saya adalah bot TikTok. Kirimkan tautan video TikTok dari vt.tiktok.com, www.tiktok.com, atau vm.tiktok.com untuk mendapatkan informasi lebih lanjut.`;
}

// Fungsi utama bot Telegram
function startTelegramBot() {
  const bot = new Telegraf('6942840133:AAFUiwpYIsRDoiPnkHUCHw6adegmurwqUbI');

  bot.start((ctx) => ctx.reply(getStartMessage()));

  bot.on('message', async (ctx) => {
    const text = ctx.message.text;
    if (text.includes('vt.tiktok.com') || text.includes('www.tiktok.com') || text.includes('vm.tiktok.com')) {
      try {
        const videoInfo = await getTikTokVideoUrl(text);
        if (videoInfo.status === 'success') {
          const { author, description } = videoInfo;
          ctx.reply(`Author: ${author}\nDescription: ${description}`);
        } else {
          ctx.reply('Maaf, tidak dapat menemukan informasi video TikTok.');
        }
      } catch (error) {
        ctx.reply('Maaf, terjadi kesalahan saat mengambil informasi video TikTok.');
        console.error(error);
      }
    } else {
      ctx.reply('Mohon kirimkan tautan video TikTok dari vt.tiktok.com, www.tiktok.com, atau vm.tiktok.com.');
    }
  });

  bot.launch();
}

startTelegramBot();
