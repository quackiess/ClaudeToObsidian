const express = require('express');
const path = require('path');
const claudeApi = require('./lib/claude-api');
const markdown = require('./lib/markdown');
const analyzer = require('./lib/analyzer');
const vault = require('./lib/vault');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// --- Setup ---

app.post('/api/setup', async (req, res) => {
  const { sessionKey } = req.body;
  if (!sessionKey) return res.status(400).json({ error: 'sessionKey is required' });

  try {
    const result = await claudeApi.testConnection(sessionKey);
    claudeApi.setSessionKey(sessionKey);

    // Save orgId for later use
    const config = claudeApi.loadConfig();
    config.orgId = result.orgId;
    claudeApi.saveConfig(config);

    res.json({ success: true, orgName: result.orgName, orgId: result.orgId });
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
});

app.post('/api/setup/clear', (req, res) => {
  const config = claudeApi.loadConfig();
  delete config.sessionKey;
  delete config.orgId;
  claudeApi.saveConfig(config);
  claudeApi.clearCache();
  res.json({ success: true });
});

// --- Chats ---

app.get('/api/chats', async (req, res) => {
  const config = claudeApi.loadConfig();
  if (!config.sessionKey || !config.orgId) {
    return res.status(401).json({ error: 'Not connected. Set up your session key first.' });
  }

  try {
    const chats = await claudeApi.getConversations(config.sessionKey, config.orgId);
    const vaultPath = vault.getVaultPath(config);
    const exportedIds = Array.from(vault.getExportedIds(vaultPath));
    res.json({ chats, exportedIds });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Export ---

app.post('/api/export', async (req, res) => {
  const { chatIds, linkPercent = 15 } = req.body;
  if (!chatIds || !Array.isArray(chatIds) || chatIds.length === 0) {
    return res.status(400).json({ error: 'No chats selected' });
  }

  const config = claudeApi.loadConfig();
  if (!config.sessionKey || !config.orgId) {
    return res.status(401).json({ error: 'Not connected' });
  }

  const vaultPath = vault.getVaultPath(config);

  try {
    // First pass: fetch all chats
    const exportedChats = [];
    for (const chatId of chatIds) {
      const chat = await claudeApi.getConversation(config.sessionKey, config.orgId, chatId);
      exportedChats.push(chat);
    }

    // Compute cross-chat terms (words that are top in 2+ chats)
    const crossChatTerms = analyzer.getCrossChatTerms(exportedChats, linkPercent);

    // Create a batch folder for this export
    const { batchName, batchPath } = vault.createBatchFolder(vaultPath);

    // Second pass: generate markdown with cross-chat awareness
    for (let i = 0; i < exportedChats.length; i++) {
      const chat = exportedChats[i];
      const chatId = chatIds[i];
      const { markdown: md, fileName } = markdown.chatToMarkdown(chat, linkPercent, crossChatTerms);
      vault.writeChatFile(batchPath, fileName, md);
      vault.markExported(vaultPath, chatId, fileName, batchName);
    }

    // Generate batch report (inside the same folder, _ prefix for top sort)
    const report = analyzer.generateReport(exportedChats, batchName, linkPercent, crossChatTerms);
    vault.writeReportFile(batchPath, batchName, report);

    res.json({
      success: true,
      exported: exportedChats.length,
      batchName,
      crossChatTerms: Array.from(crossChatTerms),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Delete chat from claude.ai ---

app.delete('/api/chats/:chatId', async (req, res) => {
  const config = claudeApi.loadConfig();
  if (!config.sessionKey || !config.orgId) {
    return res.status(401).json({ error: 'Not connected' });
  }

  try {
    await claudeApi.deleteConversation(config.sessionKey, config.orgId, req.params.chatId);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Settings ---

app.get('/api/settings', (req, res) => {
  const config = claudeApi.loadConfig();
  res.json({
    linkPercent: config.linkPercent || 15,
    vaultPath: config.vaultPath || '',
    customStopWords: config.customStopWords || '',
    sessionKey: config.sessionKey ? true : false,
  });
});

app.post('/api/settings', (req, res) => {
  const config = claudeApi.loadConfig();
  const { linkPercent, vaultPath, customStopWords } = req.body;

  if (linkPercent !== undefined) config.linkPercent = linkPercent;
  if (vaultPath !== undefined) config.vaultPath = vaultPath;
  if (customStopWords !== undefined) config.customStopWords = customStopWords;

  claudeApi.saveConfig(config);
  res.json({ success: true });
});

// --- Start ---

app.listen(PORT, () => {
  console.log(`ClaudeArchive running at http://localhost:${PORT}`);
});
