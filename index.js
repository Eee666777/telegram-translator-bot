const { Telegraf } = require('telegraf');
const translate = require('@iamtraction/google-translate'); // Нова, стабільніша бібліотека
const http = require('http');

// Встав сюди свій токен з BotFather!
const BOT_TOKEN = '8800277477:AAGTHAiuqy9sQ0eIji77Rxhcauw8or0rIWM';
const bot = new Telegraf(BOT_TOKEN);

// Хитрість для Render
const PORT = process.env.PORT || 3000;
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Бот працює і перекладає!\n');
});
server.listen(PORT, () => {
    console.log(`Міні-сервер запущено на порту ${PORT}`);
});

bot.on('message', async (ctx) => {
    if (!ctx.message || !ctx.message.text || ctx.message.text.startsWith('/')) return;
    const userText = ctx.message.text;

    try {
        // Запит до нового перекладача
        const res = await translate(userText, { to: 'en' });
        const detectedLanguage = res.from.language.iso; // Визначаємо мову
        let targetLanguage = '';

        if (detectedLanguage === 'en') {
            targetLanguage = 'ru';
        } else if (detectedLanguage === 'ru') {
            targetLanguage = 'en';
        } else {
            return; // Якщо мова інша — ігноруємо
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