const TelegramBot = require('node-telegram-bot-api');
const { telegramToken } = require('./src/config'); // Import token bot dari file config.js di dalam folder config

// Inisialisasi bot
const bot = new TelegramBot(telegramToken, { polling: true });

// Event handler saat pengguna mengirim pesan
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const userName = msg.from.first_name; // Mengambil nama pengguna dari pesan
  const messageText = msg.text.toString().toLowerCase(); // Mengubah pesan menjadi lowercase untuk memudahkan pencocokan

  // List kata kunci yang akan direspon
  const keywords = ['hai', 'hello', 'hallo', 'halo'];

  // Cek apakah pesan mengandung salah satu kata kunci
  if (keywords.some(keyword => messageText.includes(keyword))) {
    const isGroupMessage = msg.chat.type === 'group'; // Memeriksa apakah pesan berasal dari grup

    // Jika pesan berasal dari grup, balas dengan sapaan dan nama pengguna
    if (isGroupMessage) {
      bot.sendMessage(chatId, `Halo semua! Saya ${bot.options.username}. Selamat datang di grup ini.`);
    } else { // Jika pesan berasal dari obrolan pribadi
      bot.sendMessage(chatId, `Halo ${userName}! Selamat datang di bot saya.`);
    }
  }
});
