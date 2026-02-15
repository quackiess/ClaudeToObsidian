(function () {
  let connected = false;
  let chats = [];
  let selectedIds = new Set();
  let exportedIds = new Set();

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  // --- API helpers ---
  async function api(method, path, body) {
    const opts = { method, headers: { 'Content-Type': 'application/json' } };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(`/api${path}`, opts);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
  }

  function showMessage(containerId, text, type = 'info') {
    const el = $(containerId);
    el.innerHTML = `<div class="message ${type}">${text}</div>`;
  }

  // --- Connection ---
  $('#btnTestConnection').addEventListener('click', async () => {
    const key = $('#sessionKey').value.trim();
    if (!key) {
      showMessage('#setupMessage', 'Paste your session key first.', 'error');
      return;
    }
    showMessage('#setupMessage', '<span class="spinner"></span> Connecting...', 'info');
    try {
      const result = await api('POST', '/setup', { sessionKey: key });
      showMessage('#setupMessage', `Connected: <strong>${result.orgName}</strong>`, 'success');
      connected = true;
      updateConnectionStatus();
      loadChats();
    } catch (err) {
      showMessage('#setupMessage', err.message, 'error');
    }
  });

  $('#btnClearSession').addEventListener('click', async () => {
    try {
      await api('POST', '/setup/clear');
      connected = false;
      chats = [];
      selectedIds.clear();
      exportedIds.clear();
      updateConnectionStatus();
      renderChatList();
      updateStats();
      showMessage('#setupMessage', 'Session cleared.', 'info');
      $('#sessionKey').value = '';
    } catch (err) {
      showMessage('#setupMessage', err.message, 'error');
    }
  });

  function updateConnectionStatus() {
    const badge = $('#statusBadge');
    const indicator = $('#connIndicator');
    if (connected) {
      badge.classList.add('connected');
      badge.querySelector('.conn-label').textContent = 'Connected';
      indicator.classList.add('on');
      indicator.classList.remove('off');
    } else {
      badge.classList.remove('connected');
      badge.querySelector('.conn-label').textContent = 'Disconnected';
      indicator.classList.remove('on');
      indicator.classList.add('off');
    }
  }

  // --- Stats ---
  function updateStats() {
    $('#chatCount').textContent = chats.length;
    $('#selectedCount').textContent = selectedIds.size;
    $('#exportedCount').textContent = exportedIds.size;
    const disabled = selectedIds.size === 0;
    $('#btnExport').disabled = disabled;
    $('#btnExportDelete').disabled = disabled;
  }

  // --- Chats ---
  async function loadChats() {
    try {
      const data = await api('GET', '/chats');
      chats = data.chats || [];
      exportedIds = new Set(data.exportedIds || []);
      renderChatList();
      updateStats();
    } catch (err) {
      showMessage('#exportResult', `Failed to load chats: ${err.message}`, 'error');
    }
  }

  function renderChatList(filter = '') {
    const list = $('#chatList');
    const filtered = chats.filter((c) => {
      const name = (c.name || 'Untitled').toLowerCase();
      return name.includes(filter.toLowerCase());
    });

    if (filtered.length === 0 && chats.length === 0) {
      list.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </div>
          <p>Connect your account to load conversations</p>
        </div>`;
      return;
    }

    if (filtered.length === 0) {
      list.innerHTML = '<div class="empty-state"><p>No matches</p></div>';
      return;
    }

    list.innerHTML = filtered
      .map((chat, i) => {
        const id = chat.uuid;
        const title = chat.name || 'Untitled';
        const date = chat.created_at ? chat.created_at.split('T')[0] : '';
        const isExported = exportedIds.has(id);
        const isSelected = selectedIds.has(id);
        const checked = isSelected ? 'checked' : '';

        return `
          <div class="chat-item ${isExported ? 'chat-exported' : ''} ${isSelected ? 'selected' : ''}" style="animation-delay:${Math.min(i * 20, 300)}ms">
            <input type="checkbox" data-id="${id}" ${checked}>
            <div class="chat-info">
              <div class="chat-title">${escapeHtml(title)}</div>
              <div class="chat-meta">${date}${isExported ? ' &middot; exported' : ''}</div>
            </div>
            ${isExported ? '<span class="exported-badge">done</span>' : ''}
            <button class="btn-delete-chat" data-id="${id}" title="Delete from Claude.ai">&#x2715;</button>
          </div>
        `;
      })
      .join('');

    // Bind checkboxes
    list.querySelectorAll('input[type="checkbox"]').forEach((cb) => {
      cb.addEventListener('change', () => {
        if (cb.checked) selectedIds.add(cb.dataset.id);
        else selectedIds.delete(cb.dataset.id);
        // Update selected class on parent
        cb.closest('.chat-item').classList.toggle('selected', cb.checked);
        updateStats();
      });
    });

    // Bind delete buttons
    list.querySelectorAll('.btn-delete-chat').forEach((btn) => {
      btn.addEventListener('click', () => deleteChat(btn.dataset.id));
    });

    updateStats();
  }

  $('#chatSearch').addEventListener('input', (e) => renderChatList(e.target.value));
  $('#btnSelectAll').addEventListener('click', () => {
    chats.forEach((c) => selectedIds.add(c.uuid));
    renderChatList($('#chatSearch').value);
  });
  $('#btnDeselectAll').addEventListener('click', () => {
    selectedIds.clear();
    renderChatList($('#chatSearch').value);
  });
  $('#btnRefresh').addEventListener('click', loadChats);

  // --- Delete ---
  async function deleteChat(chatId) {
    const chat = chats.find((c) => c.uuid === chatId);
    const title = chat ? (chat.name || 'Untitled') : chatId;
    if (!confirm(`Delete "${title}" from Claude.ai? This cannot be undone.`)) return;
    try {
      await api('DELETE', `/chats/${chatId}`);
      chats = chats.filter((c) => c.uuid !== chatId);
      selectedIds.delete(chatId);
      renderChatList($('#chatSearch').value);
      showMessage('#exportResult', `Deleted "${title}"`, 'success');
    } catch (err) {
      showMessage('#exportResult', `Delete failed: ${err.message}`, 'error');
    }
  }

  // --- Export ---
  async function doExport(deleteAfter) {
    if (selectedIds.size === 0) return;
    const ids = Array.from(selectedIds);
    const progress = $('#exportProgress');
    const fill = $('#exportFill');
    const status = $('#exportStatus');

    progress.style.display = 'block';
    $('#exportResult').innerHTML = '';
    fill.style.width = '0%';
    status.textContent = `Exporting ${ids.length} chat(s)...`;
    $('#btnExport').disabled = true;
    $('#btnExportDelete').disabled = true;

    try {
      const linkPercent = parseInt($('#linkPercent').value) || 15;
      const data = await api('POST', '/export', { chatIds: ids, linkPercent });
      fill.style.width = deleteAfter ? '60%' : '100%';

      let msg = `<strong>${data.exported}</strong> chat(s) exported to <strong>${data.batchName}</strong>`;
      if (data.crossChatTerms && data.crossChatTerms.length > 0) {
        msg += `<br>Cross-links: ${data.crossChatTerms.join(', ')}`;
      }

      if (deleteAfter) {
        status.textContent = `Deleting from Claude.ai...`;
        let deleted = 0;
        for (const id of ids) {
          try { await api('DELETE', `/chats/${id}`); deleted++; } catch {}
          fill.style.width = `${60 + (deleted / ids.length) * 40}%`;
        }
        chats = chats.filter((c) => !ids.includes(c.uuid));
        msg += `<br>Deleted <strong>${deleted}</strong> from Claude.ai`;
      }

      fill.style.width = '100%';
      status.textContent = 'Done!';
      showMessage('#exportResult', msg, 'success');
      ids.forEach((id) => exportedIds.add(id));
      selectedIds.clear();
      renderChatList($('#chatSearch').value);
    } catch (err) {
      showMessage('#exportResult', `Export failed: ${err.message}`, 'error');
    } finally {
      setTimeout(() => { progress.style.display = 'none'; }, 4000);
      updateStats();
    }
  }

  $('#btnExport').addEventListener('click', () => doExport(false));
  $('#btnExportDelete').addEventListener('click', () => {
    const count = selectedIds.size;
    if (count === 0) return;
    if (!confirm(`Export ${count} chat(s) then DELETE from Claude.ai? Cannot be undone.`)) return;
    doExport(true);
  });

  // --- Slider ---
  $('#linkPercent').addEventListener('input', (e) => {
    $('#linkPercentValue').textContent = e.target.value;
  });

  // --- Settings ---
  async function loadSettings() {
    try {
      const data = await api('GET', '/settings');
      if (data.linkPercent) {
        $('#linkPercent').value = data.linkPercent;
        $('#linkPercentValue').textContent = data.linkPercent;
      }
      if (data.vaultPath) $('#vaultPath').value = data.vaultPath;
      if (data.customStopWords) $('#customStopWords').value = data.customStopWords;
      if (data.sessionKey) {
        connected = true;
        updateConnectionStatus();
        loadChats();
      }
    } catch {}
  }

  $('#btnSaveSettings').addEventListener('click', async () => {
    try {
      await api('POST', '/settings', {
        linkPercent: parseInt($('#linkPercent').value) || 15,
        vaultPath: $('#vaultPath').value.trim(),
        customStopWords: $('#customStopWords').value.trim(),
      });
      showMessage('#settingsMessage', 'Saved.', 'success');
    } catch (err) {
      showMessage('#settingsMessage', err.message, 'error');
    }
  });

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  loadSettings();
})();
