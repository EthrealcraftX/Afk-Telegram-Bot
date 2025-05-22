const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Har bir ishga tushgan project uchun PID saqlanadi
const runningProcesses = {};

// Projectni ishga tushirish
function runProject(id) {
  const projectPath = path.join(__dirname, '..', 'projects', id);
  const indexPath = path.join(projectPath, 'index.js');

  if (!fs.existsSync(indexPath)) {
    return { success: false, message: `index.js topilmadi: ${indexPath}` };
  }

  const logDir = path.join(__dirname, '..', 'logs');
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  const logPath = path.join(logDir, `${id}.log`);
  const out = fs.openSync(logPath, 'a');

  const child = spawn('node', ['index.js'], {
    cwd: projectPath,
    detached: true,
    stdio: ['ignore', out, out] // stdout & stderr → logga
  });

  child.unref(); // parent processdan ajratiladi
  runningProcesses[id] = child.pid;

  console.log(`✅ Project ${id} ishga tushdi. PID: ${child.pid}`);
  return { success: true, pid: child.pid };
}

// Projectni to‘xtatish
function stopProject(id) {
  const pid = runningProcesses[id];
  if (!pid) {
    console.warn(`⚠️ Project ${id} uchun PID topilmadi`);
    return { success: false, message: 'PID topilmadi' };
  }

  try {
    process.kill(pid, 'SIGTERM');
    delete runningProcesses[id];
    console.log(`⏹ Project ${id} to‘xtatildi`);
    return { success: true };
  } catch (err) {
    console.error(`❌ To‘xtatishda xatolik: ${err.message}`);
    return { success: false, message: err.message };
  }
}

// Project holatini aniqlash
function getStatus(id) {
  return runningProcesses[id] ? 'running' : 'stopped';
}

module.exports = {
  runProject,
  stopProject,
  getStatus
};
