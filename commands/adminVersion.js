const fs = require('fs');
const path = require('path');
const config = require('../config/bot.config.json');

const versionsPath = path.join(__dirname, '..', 'versions');

function getFilePath(type) {
  return path.join(versionsPath, `${type}.json`);
}

function loadVersions(type) {
  const file = getFilePath(type);
  if (!fs.existsSync(file)) return [];
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function saveVersions(type, list) {
  const file = getFilePath(type);
  fs.writeFileSync(file, JSON.stringify(list, null, 2));
}

module.exports = (bot) => {
  bot.command('addversion', async (ctx) => {
    if (!config.admins.includes(ctx.from.id)) return;

    const args = ctx.message.text.split(' ');
    if (args.length !== 3) return ctx.reply('❌ Format: /addversion [java|bedrock] [versiya]');

    const [_, type, version] = args;
    if (!['java', 'bedrock'].includes(type)) {
      return ctx.reply('❌ Server turi noto‘g‘ri. faqat "java" yoki "bedrock"');
    }

    const list = loadVersions(type);
    if (list.includes(version)) return ctx.reply('❗ Bu versiya allaqachon mavjud.');

    list.push(version);
    saveVersions(type, list);
    ctx.reply(`✅ ${type} uchun ${version} versiyasi qo‘shildi.`);
  });

  bot.command('delversion', async (ctx) => {
    if (!config.admins.includes(ctx.from.id)) return;

    const args = ctx.message.text.split(' ');
    if (args.length !== 3) return ctx.reply('❌ Format: /delversion [java|bedrock] [versiya]');

    const [_, type, version] = args;
    if (!['java', 'bedrock'].includes(type)) {
      return ctx.reply('❌ Server turi noto‘g‘ri. faqat "java" yoki "bedrock"');
    }

    const list = loadVersions(type);
    if (!list.includes(version)) return ctx.reply('❗ Bunday versiya topilmadi.');

    const updated = list.filter(v => v !== version);
    saveVersions(type, updated);
    ctx.reply(`🗑️ ${type} uchun ${version} versiyasi o‘chirildi.`);
  });
};
