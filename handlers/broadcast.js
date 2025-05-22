const fs = require('fs');
const path = require('path');
const { Markup } = require('telegraf');
const { loadUsers } = require('../utils/userUtils');

const statePath = path.join(__dirname, '..', 'storage', 'broadcast_state.json');

function readState() {
  if (!fs.existsSync(statePath)) return null;
  const raw = fs.readFileSync(statePath, 'utf8');
  return raw.trim() ? JSON.parse(raw) : null;
}

function writeState(data) {
  fs.writeFileSync(statePath, JSON.stringify(data, null, 2));
}

function clearState() {
  if (fs.existsSync(statePath)) fs.unlinkSync(statePath);
}

module.exports = async (ctx) => {
  const state = readState();
  if (state) {
    return ctx.reply('⚠️ Siz allaqachon broadcast holatidasiz.', Markup.inlineKeyboard([
      [Markup.button.callback('❌ Bekor qilish', 'cancel_broadcast')]
    ]));
  }

  writeState({ step: 'awaiting_message' });
  ctx.reply('📥 Iltimos, yubormoqchi bo‘lgan habaringizni kiriting:', Markup.inlineKeyboard([
    [Markup.button.callback('❌ Bekor qilish', 'cancel_broadcast')]
  ]));
};

module.exports.handleMessage = async (ctx) => {
  const state = readState();
  if (!state || state.step !== 'awaiting_message') return;

  const isForward = !!ctx.message.forward_from_chat || !!ctx.message.forward_from;
  const text = ctx.message.caption || ctx.message.text || '';
  const data = {
    step: 'preview',
    text,
    media: null,
    file_id: null,
    is_forward: isForward
  };

  if (ctx.message.photo) {
    const largest = ctx.message.photo.at(-1);
    data.media = 'photo';
    data.file_id = largest.file_id;
  } else if (ctx.message.document) {
    data.media = 'document';
    data.file_id = ctx.message.document.file_id;
  }

  writeState(data);

  const buttons = isForward
    ? [[Markup.button.callback('🚀 Yuborish', 'send_now')]]
    : [
        [Markup.button.callback('➕ Tugma qo‘shish', 'add_button')],
        [Markup.button.callback('🚀 Tugmasiz yuborish', 'send_now')],
        [Markup.button.callback('❌ Bekor qilish', 'cancel_broadcast')]
      ];

  if (data.media === 'photo') {
    return ctx.replyWithPhoto(data.file_id, {
      caption: data.text,
      ...Markup.inlineKeyboard(buttons)
    });
  }

  if (data.media === 'document') {
    return ctx.replyWithDocument(data.file_id, {
      caption: data.text,
      ...Markup.inlineKeyboard(buttons)
    });
  }

  return ctx.reply(data.text, Markup.inlineKeyboard(buttons));
};

module.exports.handleAction = async (ctx) => {
  const state = readState();
  const action = ctx.callbackQuery.data;

  if (action === 'cancel_broadcast') {
    clearState();
    try {
      await ctx.deleteMessage();
    } catch {
      await ctx.reply('❌ Broadcast bekor qilindi.');
    }
    return;
  }

  if (action === 'add_button') {
    if (state.is_forward) {
      return ctx.answerCbQuery('❗ Forward qilingan xabarga tugma qo‘shib bo‘lmaydi.', { show_alert: true });
    }

    state.step = 'awaiting_btn_text';
    writeState(state);
    return ctx.reply('✏️ Tugma nomini yozing:');
  }

  if (action === 'send_now') {
    const users = loadUsers();
    let success = 0, fail = 0;

    const btns = (state.btn_text && state.btn_url)
      ? Markup.inlineKeyboard([[Markup.button.url(state.btn_text, state.btn_url)]])
      : undefined;

    for (const userId of users) {
      try {
        if (state.media === 'photo') {
          await ctx.telegram.sendPhoto(userId, state.file_id, {
            caption: state.text,
            ...btns
          });
        } else if (state.media === 'document') {
          await ctx.telegram.sendDocument(userId, state.file_id, {
            caption: state.text,
            ...btns
          });
        } else {
          await ctx.telegram.sendMessage(userId, state.text, btns);
        }
        success++;
      } catch {
        fail++;
      }
    }

    clearState();

    try {
      await ctx.editMessageText(`✅ Broadcast yuborildi!\nYuborilganlar: ${success} ta\nXatoliklar: ${fail} ta`);
    } catch (err) {
      await ctx.reply(`✅ Broadcast yuborildi!\nYuborilganlar: ${success} ta\nXatoliklar: ${fail} ta`);
    }

    return;
  }
};

module.exports.handleMessageStep = async (ctx) => {
  const state = readState();
  if (!state) return;
  const text = ctx.message.text?.trim();
  if (!text) return;

  if (state.step === 'awaiting_btn_text') {
    state.btn_text = text;
    state.step = 'awaiting_btn_url';
    writeState(state);
    return ctx.reply('🔗 Endi tugmaga URL yuboring (https://...)');
  }

  if (state.step === 'awaiting_btn_url') {
    if (!/^https?:\/\//.test(text)) {
      return ctx.reply('❌ URL noto‘g‘ri. https:// bilan boshlanishi kerak.');
    }

    state.btn_url = text;
    state.step = 'preview';
    writeState(state);

    return ctx.reply('✅ Tugma qo‘shildi! Endi "🚀 Tugmasiz yuborish" tugmasini bosing yoki boshqa tugma tanlang.');
  }
};
