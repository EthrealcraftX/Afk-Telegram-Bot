const config = require('../config/bot.config.json');

function isAdmin(userId) {
  if (Array.isArray(config.adminId)) {
    return config.adminId.includes(userId);
  }
  return userId === config.adminId;
}

module.exports = {
  onlyAdmin: (ctx, next) => {
    const userId = ctx.from.id;
    

    if (!isAdmin(userId)) {
      return ctx.reply('⛔ Bu komanda faqat adminlar uchun.');
    }

    return next();
  }
};
