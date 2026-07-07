const { Telegraf } = require('telegraf');
const { translate } = require('@vitalets/google-translate-api');

// УВАГА: Встав сюди свій токен, який ти брав у @BotFather! Лапки залишай.
const BOT_TOKEN = '8800277477:AAGTHAiuqy9sQ0eIji77Rxhcauw8or0rIWM';

const bot = new Telegraf(BOT_TOKEN);

// Головна логіка обробки повідомлень у чаті
bot.on('message', async (ctx) => {
    // Ігноруємо сервісні повідомлення (наприклад, "Користувач зайшов у чат")
    // та ігноруємо команди, що починаються з косої риски (наприклад, /start)
    if (!ctx.message || !ctx.message.text || ctx.message.text.startsWith('/')) return;

    const userText = ctx.message.text;

    try {
        // Спочатку робимо тестовий переклад на англійську, щоб дізнатися оригінальну мову тексту
        const detectRes = await translate(userText, { to: 'en' });
        const detectedLanguage = detectRes.raw.src; // Отримуємо код мови (наприклад, 'en' чи 'ru')

        let targetLanguage = '';

        // Визначаємо напрямок перекладу
        if (detectedLanguage === 'en') {
            // Якщо написали англійською -> перекладаємо на російську
            targetLanguage = 'ru';
        } else if (detectedLanguage === 'ru') {
            // Якщо написали російською -> перекладаємо на англійську
            targetLanguage = 'en';
        } else {
            // Якщо мова будь-яка інша (наприклад, українська) — бот просто мовчить
            return;
        }

        // Робимо фінальний переклад на потрібну мову
        const translation = await translate(userText, { to: targetLanguage });
        
        // Вибираємо відповідний прапорець для гарного виводу
        const flag = targetLanguage === 'en' ? '🇬🇧' : '🇷🇺';

        // Відповідаємо реплаєм (відповіддю) саме на те повідомлення, яке нам надіслали
        await ctx.reply(`${flag} Переклад: ${translation.text}`, {
            reply_to_message_id: ctx.message.message_id
        });

    } catch (error) {
        console.error('Помилка під час перекладу повідомлення:', error);
    }
});

// Запуск бота
bot.launch().then(() => {
    console.log('Бот-перекладач успішно запущений і готовий до роботи!');
}).catch((err) => {
    console.error('Не вдалося запустити бота:', err);
});

// Налаштування для безпечного та плавного вимкнення процесу
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));