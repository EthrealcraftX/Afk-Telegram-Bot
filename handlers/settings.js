const fs = require('fs');
const path = require('path');
const { Markup } = require('telegraf');

const configPath = path.join(__dirname, '..', 'config', 'bot.config.json');

function readConfig() {
  const raw = fs.readFileSync(configPath, 'utf8');
  return JSON.parse(raw);
}

function writeConfig(data) {
  fs.writeFileSync(configPath, JSON.stringify(data, null, 2));
}

module.exports = (ctx) => {
  const config = readConfig();
  const msg = `🛠 *Sozlamalar:*\n\n` +
              `👤 Max Projects per User: *${config.maxProjectsPerUser}*\n` +
              `🕓 Auto Delete After Hours: *${config.autoDeleteAfterHours}*\n` +
              `📢 Force Subscribe: *${config.enableForceSub ? '✅ YONDA' : '❌ O‘CHIQ'}*`;

  ctx.reply(msg, {
    parse_mode: 'Markdown',
    ...Markup.inlineKeyboard([
      [
        Markup.button.callback('➖ Limit', 'limit_dec'),
        Markup.button.callback('➕ Limit', 'limit_inc')
      ],
      [
        Markup.button.callback('🕒 -1 hour', 'autodel_dec'),
        Markup.button.callback('🕓 +1 hour', 'autodel_inc')
      ],
      [
        Markup.button.callback('🔁 ForceSub ON/OFF', 'toggle_forcesub')
      ]
    ])
  });
};

module.exports.handleAction = (ctx) => {
  const config = readConfig();
  let changed = false;

  const data = ctx.callbackQuery.data;

  switch (data) {
    case 'limit_inc':
      config.maxProjectsPerUser += 1;
      changed = true;
      break;
    case 'limit_dec':
      if (config.maxProjectsPerUser > 1) {
        config.maxProjectsPerUser -= 1;
        changed = true;
      }
      break;
    case 'autodel_inc':
      config.autoDeleteAfterHours += 1;
      changed = true;
      break;
    case 'autodel_dec':
      if (config.autoDeleteAfterHours > 1) {
        config.autoDeleteAfterHours -= 1;
        changed = true;
      }
      break;
    case 'toggle_forcesub':
      config.enableForceSub = !config.enableForceSub;
      changed = true;
      break;
  }

  if (changed) {
    writeConfig(config);
    return ctx.editMessageText(
      `✅ Yangilandi:\n\n👤 Max Projects: *${config.maxProjectsPerUser}*\n🕓 Auto Delete: *${config.autoDeleteAfterHours}* soat\n📢 Force Subscribe: *${config.enableForceSub ? '✅ YONDA' : '❌ O‘CHIQ'}*`,
      {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
          [
            Markup.button.callback('➖ Limit', 'limit_dec'),
            Markup.button.callback('➕ Limit', 'limit_inc')
          ],
          [
            Markup.button.callback('🕒 -1 hour', 'autodel_dec'),
            Markup.button.callback('🕓 +1 hour', 'autodel_inc')
          ],
          [
            Markup.button.callback('🔁 ForceSub ON/OFF', 'toggle_forcesub')
          ]
        ])
      }
    );
  }
};
