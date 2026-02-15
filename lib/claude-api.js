const https = require('https');
const fs = require('fs');
const path = require('path');

const CACHE_DIR = path.join(__dirname, '..', '.cache');
const CONFIG_PATH = path.join(__dirname, '..', 'config.json');

function loadConfig() {
  try {
    return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
  } catch {
    return {};
  }
}

function saveConfig(config) {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
}

function getSessionKey() {
  const config = loadConfig();
  return config.sessionKey || null;
}

function setSessionKey(key) {
  const config = loadConfig();
  config.sessionKey = key;
  saveConfig(config);
}

function apiRequest(urlPath, sessionKey, method = 'GET') {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'claude.ai',
      path: urlPath,
      method,
      headers: {
        'Cookie': `sessionKey=${sessionKey}`,
        'Accept': 'application/json',
        'User-Agent': 'ClaudeArchive/1.0',
        'Content-Type': 'application/json',
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          if (!data) return resolve({ success: true });
          try {
            resolve(JSON.parse(data));
          } catch {
            resolve({ success: true });
          }
        } else if (res.statusCode === 403 || res.statusCode === 401) {
          reject(new Error('Authentication failed. Check your sessionKey.'));
        } else {
          reject(new Error(`API request failed with status ${res.statusCode}`));
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function deleteConversation(sessionKey, orgId, conversationId) {
  return apiRequest(
    `/api/organizations/${orgId}/chat_conversations/${conversationId}`,
    sessionKey,
    'DELETE'
  );
}

async function getOrganizations(sessionKey) {
  return apiRequest('/api/organizations', sessionKey);
}

async function getConversations(sessionKey, orgId) {
  return apiRequest(`/api/organizations/${orgId}/chat_conversations`, sessionKey);
}

async function getConversation(sessionKey, orgId, conversationId) {
  // Check cache first
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  }

  const cachePath = path.join(CACHE_DIR, `${conversationId}.json`);
  if (fs.existsSync(cachePath)) {
    try {
      return JSON.parse(fs.readFileSync(cachePath, 'utf8'));
    } catch {
      // Cache corrupted, re-fetch
    }
  }

  const data = await apiRequest(
    `/api/organizations/${orgId}/chat_conversations/${conversationId}`,
    sessionKey
  );

  // Cache the result
  fs.writeFileSync(cachePath, JSON.stringify(data, null, 2));
  return data;
}

async function testConnection(sessionKey) {
  const orgs = await getOrganizations(sessionKey);
  if (!Array.isArray(orgs) || orgs.length === 0) {
    throw new Error('No organizations found');
  }
  return { success: true, orgId: orgs[0].uuid, orgName: orgs[0].name || 'Default' };
}

function clearCache() {
  if (fs.existsSync(CACHE_DIR)) {
    const files = fs.readdirSync(CACHE_DIR);
    for (const file of files) {
      fs.unlinkSync(path.join(CACHE_DIR, file));
    }
  }
}

module.exports = {
  loadConfig,
  saveConfig,
  getSessionKey,
  setSessionKey,
  getOrganizations,
  getConversations,
  getConversation,
  deleteConversation,
  testConnection,
  clearCache,
};
