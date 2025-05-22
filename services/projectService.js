const axios = require('axios');
const path = require('path');
const fs = require('fs');
const generateId = require('../utils/generateId');
const { copyFolderSync } = require('../utils/fileUtils');
const processManager = require('../utils/projectProcessManager');
const config = require('../config/bot.config.json');


const API_URL = 'http://localhost:3000/api/telegram-action';
const token = config.apiToken;


const projectsPath = path.join(__dirname, '..', '..', 'projects');
const templatesPath = path.join(__dirname, '..', '..', 'templates');

exports.createProject = async (data) => {
  const id = generateId();
  const newProjectPath = path.join(projectsPath, id);
  const selectedTemplatePath = path.join(templatesPath, data.template);

  if (!fs.existsSync(selectedTemplatePath)) {
    return { success: false, message: 'Tanlangan template topilmadi' };
  }

  try {
    // Template clone qilish
    fs.mkdirSync(newProjectPath, { recursive: true });
    copyFolderSync(selectedTemplatePath, newProjectPath);

    // config.json ni yaratish
    const configData = {
      host: data.ip || 'localhost',
      port: data.port || 19132,
      version: data.version || '1.20.4'
    };

    const configPath = path.join(newProjectPath, 'config.json');
    fs.writeFileSync(configPath, JSON.stringify(configData, null, 2));

    return { success: true, id };
  } catch (err) {
    return { success: false, message: 'Yaratishda xatolik: ' + err.message };
  }
};

exports.runProject = async (projectId) => {
  return processManager.runProject(projectId);
};

exports.stopProject = async (projectId) => {
  return processManager.stopProject(projectId);
};

exports.getStatus = (projectId) => {
  return processManager.getStatus(projectId);
};



exports.deleteProject = async (projectId) => {
  try {
    const url = `http://localhost:3000/api/delete/${projectId}`;
    const response = await axios.delete(url, {
      headers: {
        Authorization: `Bearer ${config.apiToken}`
      }
    });

    return { success: true, data: response.data };
  } catch (err) {
    console.error('[API delete] ERROR:', err.message);
    return { success: false, message: 'API server bilan ulanishda xatolik' };
  }
};




async function sendCommand(command, payload = {}) {
  try {
    const response = await axios.post(API_URL, {
      command,
      payload,
      token
    });

    return response.data;
  } catch (err) {
    console.error(`[API ${command}] ERROR:`, err.message);
    return {
      success: false,
      message: 'API server bilan ulanishda xatolik'
    };
  }
}

module.exports = {
  createProject: (payload) => sendCommand('create', payload),
  runProject: (id) => sendCommand('run', { id }),
  stopProject: (id) => sendCommand('stop', { id }),
  deleteProject: (id) => sendCommand('delete', { id }),
  getStatus: (id) => sendCommand('status', { id })
};