const config = require('../config/bot.config.json');
const { Markup } = require('telegraf');

module.exports = async function forceCheck(ctx, forceChannel) {
  const userId = ctx.from.id;

  try {
    const member = await ctx.telegram.getChatMember(forceChannel, userId);

    // Agar user ban bo‘lgan bo‘lsa yoki left bo‘lsa
    if (['left', 'kicked'].includes(member.status)) {
      await ctx.reply(
        `⛔ Botdan foydalanish uchun quyidagi kanalda a’zo bo‘lishingiz kerak:\n\n${forceChannel}`,
        Markup.inlineKeyboard([
          [Markup.button.url("➕ Kanalga qo‘shilish", `https://t.me/${forceChannel.replace('@', '')}`)],
          [Markup.button.callback("✅ Tekshirish", 'check_sub')]
        ])
      );
      return false;
    }

    // A’zo bo‘lsa
    return true;
  } catch (err) {
    console.error(`❌ Force check error:`, err.message);
    await ctx.reply(`⛔ Kanalga ulanishda xatolik:\n${err.message}`);
    return false;
  }
};