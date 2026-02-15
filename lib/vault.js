const fs = require('fs');
const path = require('path');

const DEFAULT_VAULT_PATH = path.join(require('os').homedir(), 'Documents', 'ClaudeArchive');
const STATE_FILE = 'export-state.json';

function getVaultPath(config) {
  return config.vaultPath || DEFAULT_VAULT_PATH;
}

function ensureVault(vaultPath) {
  if (!fs.existsSync(vaultPath)) {
    fs.mkdirSync(vaultPath, { recursive: true });
  }
  const obsidianDir = path.join(vaultPath, '.obsidian');
  if (!fs.existsSync(obsidianDir)) {
    fs.mkdirSync(obsidianDir, { recursive: true });
    fs.writeFileSync(
      path.join(obsidianDir, 'app.json'),
      JSON.stringify({ alwaysUpdateLinks: true }, null, 2)
    );
  }
}

// Each export gets its own folder: "2026-02-15_export-1/"
// Report inside starts with _ so it sorts to top
function createBatchFolder(vaultPath) {
  ensureVault(vaultPath);
  const date = new Date().toISOString().split('T')[0];

  let num = 1;
  const entries = fs.existsSync(vaultPath) ? fs.readdirSync(vaultPath) : [];
  const existing = entries.filter(f => {
    const full = path.join(vaultPath, f);
    return fs.statSync(full).isDirectory() && f.startsWith(date + '_export');
  });
  if (existing.length > 0) num = existing.length + 1;

  const batchName = `${date}_export-${num}`;
  const batchPath = path.join(vaultPath, batchName);
  fs.mkdirSync(batchPath, { recursive: true });
  return { batchName, batchPath };
}

function writeChatFile(batchPath, fileName, markdown) {
  const filePath = path.join(batchPath, `${fileName}.md`);
  fs.writeFileSync(filePath, markdown);
  return filePath;
}

function writeReportFile(batchPath, batchName, reportMarkdown) {
  // _ prefix sorts it to the top in file explorers / Obsidian
  const filePath = path.join(batchPath, `_Report-${batchName}.md`);
  fs.writeFileSync(filePath, reportMarkdown);
  return filePath;
}

function loadState(vaultPath) {
  const statePath = path.join(vaultPath, STATE_FILE);
  try {
    return JSON.parse(fs.readFileSync(statePath, 'utf8'));
  } catch {
    return { exportedChats: {} };
  }
}

function saveState(vaultPath, state) {
  const statePath = path.join(vaultPath, STATE_FILE);
  fs.writeFileSync(statePath, JSON.stringify(state, null, 2));
}

function markExported(vaultPath, chatId, fileName, batchName) {
  const state = loadState(vaultPath);
  state.exportedChats[chatId] = {
    fileName,
    batchName,
    exportedAt: new Date().toISOString(),
  };
  saveState(vaultPath, state);
}

function getExportedIds(vaultPath) {
  const state = loadState(vaultPath);
  return new Set(Object.keys(state.exportedChats));
}

module.exports = {
  DEFAULT_VAULT_PATH,
  getVaultPath,
  ensureVault,
  createBatchFolder,
  writeChatFile,
  writeReportFile,
  loadState,
  saveState,
  markExported,
  getExportedIds,
};
