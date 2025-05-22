const { Markup } = require('telegraf');
const path = require('path');
const fs = require('fs');

const serverTypeKeyboard = Markup.keyboard([
  ['bedrock', 'java']
]).oneTime().resize();

function getVersionKeyboard(type) {
  const filePath = path.join(__dirname, '..', 'versions', `${type}.json`);
  if (!fs.existsSync(filePath)) return Markup.removeKeyboard();

  const versions = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const rows = [];

  for (let i = 0; i < versions.length; i += 2) {
    rows.push(versions.slice(i, i + 2));
  }

  return Markup.keyboard(rows).oneTime().resize();
}

module.exports = {
  serverTypeKeyboard,
  getVersionKeyboard
};
