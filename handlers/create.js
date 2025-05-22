const fs = require('fs');
const path = require('path');
const { Markup } = require('telegraf');
const { serverTypeKeyboard, getVersionKeyboard } = require('../keyboards/keyboards');
const projectService = require('../services/projectService');
const config = require('../config/bot.config.json');

const statePath = path.join(__dirname, '..', 'storage', 'create_state.json');
const usersPath = path.join(__dirname, '..', 'storage', 'users.json');

function readState() {
  if (!fs.existsSync(statePath)) return {};
  const file = fs.readFileSync(statePath, 'utf8');
  return file.trim() ? JSON.parse(file) : {};
}

function writeState(state) {
  fs.writeFileSync(statePath, JSON.stringify(state, null, 2));
}

function clearUserState(userId) {
  const state = readState();
  delete state[userId];
  writeState(state);
}

module.exports = async (ctx) => {
  const userId = String(ctx.from.id);
  const users = fs.existsSync(usersPath)
    ? JSON.parse(fs.readFileSync(usersPath, 'utf8'))
    : {};

  const userProjects = users[userId]?.projects || [];

  if (userProjects.length >= (config.maxProjectsPerUser || 1)) {
    return ctx.reply(`❗ Siz maksimal ${config.maxProjectsPerUser} ta project yarata olasiz.`);
  }

  const state = readState();
  state[userId] = { step: 'awaiting_ip', data: {} };
  writeState(state);

  ctx.reply('📥 Iltimos, IP addressni kiriting,misol: hypepath.aternos.me');
};

module.exports.handleMessage = async (ctx) => {
  const userId = String(ctx.from.id);
  const text = ctx.message.text.trim();
  const state = readState();
  const users = fs.existsSync(usersPath)
    ? JSON.parse(fs.readFileSync(usersPath, 'utf8'))
    : {};

  const userState = state[userId];
  if (!userState) return;

  const data = userState.data;

  if (userState.step === 'awaiting_ip') {
    data.ip = text;
    userState.step = 'awaiting_port';
    ctx.reply('📟 Endi portni kiriting,misol: 19132');
  }

  else if (userState.step === 'awaiting_port') {
    if (!/^\d{4,5}$/.test(text)) {
      return ctx.reply('❌ Noto‘g‘ri port. Masalan: 19132');
    }
    data.port = text;
    userState.step = 'awaiting_template';
    ctx.reply('🧩 Minecraft turini tanlang:', serverTypeKeyboard);
  }

  else if (userState.step === 'awaiting_template') {
    const template = text.toLowerCase();
    if (!['bedrock', 'java'].includes(template)) {
      return ctx.reply('❌ Noto‘g‘ri tanlov. faqat "bedrock" yoki "java" taleng yoki yozing', serverTypeKeyboard);
    }

    data.template = template;
    userState.step = 'awaiting_version';
    ctx.reply('🧱 Versiyani tanlang:', getVersionKeyboard(template));
  }

  else if (userState.step === 'awaiting_version') {
    data.version = text;

    ctx.telegram.sendMessage(ctx.chat.id, '⏳ Project yaratilmoqda...', {
      reply_markup: { remove_keyboard: true }
    });

    const result = await projectService.createProject(data);
    if (!result.success) {
      clearUserState(userId);
      return ctx.reply('❌ Xatolik: ' + result.message);
    }

    if (!users[userId]) {
      users[userId] = { projects: [] };
    }
    
    users[userId].projects.push({
      id: result.id,
      createdAt: new Date().toISOString(),
      status: 'pending'
    });    

    fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));

    clearUserState(userId);

    return ctx.reply(
      `✅ Project yaratildi!\nID: ${result.id}\n\n▶️ Run — projectni ishga tushurish\n🗃 /projects - yaslagan projectal korish`,
      Markup.inlineKeyboard([
        [Markup.button.callback('▶️ Run', 'run_project')]
      ])
    );
  }

  writeState(state);
};
