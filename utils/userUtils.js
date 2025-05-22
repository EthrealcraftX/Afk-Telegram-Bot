const fs = require('fs');
const path = require('path');
const usersPath = path.join(__dirname, '..', 'storage', 'users.json');

function loadUsers() {
  if (!fs.existsSync(usersPath)) return [];
  const data = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
  return Object.keys(data);
}

module.exports = {
  loadUsers
};
