const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

const logPath = path.join(__dirname, '..', '..', 'logs');
const logFile = path.join(logPath, 'bot.log');

if (!fs.existsSync(logPath)) {
  fs.mkdirSync(logPath, { recursive: true });
}

function formatDate() {
  return new Date().toISOString().replace('T', ' ').split('.')[0];
}

function writeLog(level, message) {
  const time = formatDate();
  const logLine = `[${time}] [${level}] ${message}\n`;
  fs.appendFileSync(logFile, logLine);

  if (level === 'ERROR') {
    console.error(chalk.red(logLine.trim()));
  } else {
    console.log(chalk.green(logLine.trim()));
  }
}

module.exports = {
  info: (msg) => writeLog('INFO', msg),
  error: (msg) => writeLog('ERROR', msg)
};