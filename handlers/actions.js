const fs = require('fs');
const path = require('path');
const projectService = require('../services/projectService');
const usersPath = path.join(__dirname, '..', 'storage', 'users.json');

function getProjectById(users, projectId) {
  for (const [uid, user] of Object.entries(users)) {
    const found = user.projects.find(p => p.id === projectId);
    if (found) return { user, uid, project: found };
  }
  return {};
}

exports.runProject = async (ctx) => {
  const projectId = ctx.match.input.split('_')[1];
  const users = JSON.parse(fs.readFileSync(usersPath));
  const { user, project } = getProjectById(users, projectId);

  if (!user || !project) return ctx.reply('❌ Project topilmadi');

  const result = await projectService.runProject(projectId);
  if (!result.success) return ctx.reply(`❌ Run xatolik: ${result.message}`);

  project.status = 'running';
  project.runAt = new Date().toISOString();
  fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));

  try { await ctx.deleteMessage(); } catch {}
  return ctx.reply(`▶️ Project ishga tushdi: ${projectId}`);
};

exports.stopProject = async (ctx) => {
  const projectId = ctx.match.input.split('_')[1];
  const users = JSON.parse(fs.readFileSync(usersPath));
  const { user, project } = getProjectById(users, projectId);

  if (!user || !project) return ctx.reply('❌ Project topilmadi');

  const result = await projectService.stopProject(projectId);
  if (!result.success) return ctx.reply(`❌ Stop xatolik: ${result.message}`);

  project.status = 'stopped';
  project.stoppedAt = new Date().toISOString();
  fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));

  try { await ctx.deleteMessage(); } catch {}
  return ctx.reply(`⏹ Project to‘xtatildi: ${projectId}`);
};

exports.deleteProject = async (ctx) => {
    const projectId = ctx.match.input.split('_')[1];
    const users = JSON.parse(fs.readFileSync(usersPath));
    const { user, uid, project } = getProjectById(users, projectId);
  
    if (!user || !project) return ctx.reply('❌ Project topilmadi.');
  
    // RUNNING deb saqlangan bo‘lsa — stop qilishga urinamiz
    if (project.status === 'running') {
      try {
        const stopResult = await projectService.stopProject(projectId);
        if (!stopResult.success) {
          console.warn(`⚠️ Stop error: ${stopResult.message}`);
        }
      } catch (e) {
        console.warn(`⚠️ Stop xatolik: ${e.message}`);
      }
    }
  
    // Fayllarni o‘chirish
    const projectPath = path.join(__dirname, '..', 'projects', projectId);
    if (fs.existsSync(projectPath)) {
      fs.rmSync(projectPath, { recursive: true, force: true });
    }

    // Botni delete handler ichida:

    const result = await projectService.deleteProject(projectId);
    if (!result.success) {
      return ctx.reply(`❌ API delete xatolik: ${result.message}`);
    }

  
    // users.json dan o‘chirish
    user.projects = user.projects.filter(p => p.id !== projectId);
    if (user.projects.length === 0) delete users[uid];
  
    fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));
  
    try { await ctx.deleteMessage(); } catch {}
    return ctx.reply(`🗑 Project o‘chirildi: ${projectId}`);
  };
  