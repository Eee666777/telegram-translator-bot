const { Telegraf } = require('telegraf');
const { translate } = require('@vitalets/google-translate-api');
const http = require('http'); // Додаємо вбудований модуль для створення міні-сайту

// Встав сюди свій токен з BotFather!
const BOT_TOKEN = '8800277477:AAGTHAiuqy9sQ0eIji77Rxhcauw8or0rIWM';
const bot = new Telegraf(BOT_TOKEN);

// --- ХИТРІСТЬ ДЛЯ ХОСТИНГУ RENDER ---
// Створюємо пустий веб-сервер, щоб Render думав, що це сайт, і не вимикав бота
const PORT = process.env.PORT || 3000;
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Бот працює і перекладає!\n');
});
server.listen(PORT, () => {
    console.log(`Міні-сервер запущено на порту ${PORT} для обходу лімітів Render.`);
});
// -------------------------------------

bot.on('message', async (ctx) => {
    if (!ctx.message || !ctx.message.text || ctx.message.text.startsWith('/')) return;
    const userText = ctx.message.text;

    try {
        const detectRes = await translate(userText, { to: 'en' });
        const detectedLanguage = detectRes.raw.src;
        let targetLanguage = '';

        if (detectedLanguage === 'en') {
            targetLanguage = 'ru';
        } else if (detectedLanguage === 'ru') {
            targetLanguage = 'en';
        } else {
            return;
        }

        const translation = await translate(userText, { to: targetLanguage });
        const flag = targetLanguage === 'en' ? '🇬🇧' : '🇷🇺';

        await ctx.reply(`${flag} Переклад: ${translation.text}`, {
            reply_to_message_id: ctx.message.message_id
        });
    } catch (error) {
        console.error('Помилка перекладу:', error);
    }
});

bot.launch().then(() => {
    console.log('Бот-перекладач успішно запущений!');
}).catch((err) => {
    console.error('Помилка запуску:', err);
});

process.once('SIGINT', () => { bot.stop('SIGINT'); server.close(); });
process.once('SIGTERM', () => { bot.stop('SIGTERM'); server.close(); });