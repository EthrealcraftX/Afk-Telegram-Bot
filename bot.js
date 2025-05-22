const { Telegraf, Markup } = require('telegraf');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// .env token yuklash
dotenv.config();
const BOT_TOKEN = process.env.BOT_TOKEN;
if (!BOT_TOKEN) throw new Error('❌ BOT_TOKEN topilmadi!');

const config = require('./config/bot.config.json');
const logger = require('./utils/logger');

const bot = new Telegraf(BOT_TOKEN);

// ───── HANDLERS ─────
const createHandler = require('./handlers/create');
const runHandler = require('./handlers/run');
const stopHandler = require('./handlers/stop');
const deleteHandler = require('./handlers/delete');
const statsHandler = require('./handlers/stats');
const broadcastHandler = require('./handlers/broadcast');
const settingsHandler = require('./handlers/settings');
const helpHandler = require('./handlers/help');
const setHelpHandler = require('./handlers/setHelp');
const forceCheck = require('./handlers/forceCheck');
const updateDeps = require('./handlers/updateDeps');
const projectsHandler = require('./handlers/projects');
const adminProjects = require('./handlers/adminProjects');


// ───── ADMIN COMMANDS ─────
const adminVersion = require('./commands/adminVersion')(bot);

// ───── MIDDLEWARE ─────
const auth = require('./middlewares/auth');

// ───── SCHEDULER ─────
const scheduler = require('./services/scheduler');
scheduler.startAutoDeletion();

// ───── /START COMMAND ─────
bot.start(async (ctx) => {
  logger.info(`/start - ${ctx.from.username || ctx.from.id}`);

  if (config.enableForceSub) {
    const ok = await forceCheck(ctx, config.forceChannel);
    if (!ok) return;
  }

  const usersPath = path.join(__dirname, 'storage', 'users.json');
  const users = fs.existsSync(usersPath)
    ? JSON.parse(fs.readFileSync(usersPath))
    : {};
  const user = users[ctx.from.id];
  const hasProject = user && user.projectId;

  const imagePath = path.join(__dirname, 'assets', 'start.jpg');
  const caption = hasProject
    ? `✅ Sizda project mavjud. Holat: <b>${user.status || 'unknown'}</b>`
    : '👋 Assalomu alaykum!\n Avto server botga xush kelibsiz!\nSizda hali project yaratilmagan, boshlash uchun pastagi tugmani bosing';

  const buttons = hasProject
    ? Markup.inlineKeyboard([
        [Markup.button.callback(user.status === 'running' ? '⏹️ Stop' : '▶️ Run', user.status === 'running' ? 'stop_project' : 'run_project')],
        [Markup.button.callback('🗑 Delete', 'delete_project')]
      ])
    : Markup.inlineKeyboard([
        [Markup.button.callback('▶️ Project Yasash', 'start_create')]
      ]);

  try {
    await ctx.replyWithPhoto(
      { source: imagePath },
      {
        caption,
        parse_mode: 'HTML',
        reply_markup: buttons.reply_markup
      }
    );
  } catch (e) {
    logger.error('❌ start.jpg yuborishda xatolik:', e.message);
    await ctx.replyWithHTML(caption, buttons);
  }
});

// ───── COMMANDLAR ─────
bot.command('help', helpHandler);
bot.command('sethelp', auth.onlyAdmin, setHelpHandler);
bot.command('create', createHandler);
bot.command('run', runHandler);
bot.command('stop', stopHandler);
bot.command('delete', deleteHandler);
bot.command('stats', auth.onlyAdmin, statsHandler);
bot.command('broadcast', auth.onlyAdmin, broadcastHandler);
bot.command('settings', auth.onlyAdmin, settingsHandler);
bot.command('updatepkgs', auth.onlyAdmin, updateDeps);
bot.command('projects', projectsHandler);
bot.command('projectsall', auth.onlyAdmin, adminProjects);


// ───── INLINE ACTIONLAR ─────
bot.action('start_create', createHandler);
bot.action('run_project', runHandler);
bot.action('stop_project', stopHandler);
bot.action('delete_project', deleteHandler);
bot.action(['limit_inc', 'limit_dec', 'autodel_inc', 'autodel_dec', 'toggle_forcesub'], auth.onlyAdmin, settingsHandler.handleAction);
bot.action(['add_button', 'send_now', 'cancel_broadcast'], auth.onlyAdmin, broadcastHandler.handleAction);
bot.action('help_again', helpHandler);
bot.action('check_versions', updateDeps.handleAction);
bot.action(/^view_/, projectsHandler.viewProject);
bot.action(/^back_/, projectsHandler); // qaytish
bot.action(/^run_/, require('./handlers/actions').runProject);
bot.action(/^stop_/, require('./handlers/actions').stopProject);
bot.action(/^delete_/, require('./handlers/actions').deleteProject);
bot.action(/^admin_view_/, adminProjects.viewProject);
bot.action('projectsall_back', adminProjects);
bot.action(['send_now', 'cancel_broadcast', 'add_button'], broadcastHandler.handleAction);

bot.on('text', createHandler.handleMessage);
bot.on('text', broadcastHandler.handleMessage); // matn kiritish
bot.on('message', broadcastHandler.handleMessage);
bot.on('message', broadcastHandler.handleMessageStep);
// ───── RUNNING ─────
bot.launch();
logger.info('✅ Bot ishga tushdi!');

// Graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
