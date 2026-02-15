const { getLinkedWords, extractMessageText, sanitizeFileName } = require('./analyzer');

function chatToMarkdown(chat, linkPercent, crossChatTerms) {
  const messages = chat.chat_messages || [];
  const title = chat.name || 'Untitled';
  const createdAt = chat.created_at || new Date().toISOString();
  const date = createdAt.split('T')[0];
  const fileName = sanitizeFileName(title, createdAt);

  // Gather all text for frequency analysis
  let allText = '';
  for (const msg of messages) {
    allText += extractMessageText(msg) + ' ';
  }

  const totalWords = allText.split(/\s+/).filter(w => w.length > 0).length;
  const linkedWords = getLinkedWords(allText, linkPercent, crossChatTerms);
  const linkSet = new Set(linkedWords.map(w => w.word));

  // YAML frontmatter
  let md = '---\n';
  md += `title: "${title.replace(/"/g, '\\"')}"\n`;
  md += `date: ${date}\n`;
  md += `messages: ${messages.length}\n`;
  md += `words: ${totalWords}\n`;
  md += `linked_terms: [${linkedWords.map(w => `"${w.word}"`).join(', ')}]\n`;
  md += '---\n\n';

  md += `# ${title}\n\n`;

  // Render each message
  for (const msg of messages) {
    const sender = msg.sender === 'human' ? 'You' : 'Claude';
    md += `## ${sender}\n\n`;

    let text = extractMessageText(msg);
    text = applyLinks(text, linkSet);
    md += text + '\n\n---\n\n';
  }

  return { markdown: md, fileName, linkedWords };
}

function applyLinks(text, linkSet) {
  if (linkSet.size === 0) return text;

  // Don't link inside code blocks — split on code fences, only process non-code parts
  const parts = text.split(/(```[\s\S]*?```|`[^`]+`)/g);

  for (let i = 0; i < parts.length; i++) {
    // Skip code blocks (odd indices from the split are captured groups)
    if (parts[i].startsWith('`')) continue;

    for (const word of linkSet) {
      // Replace whole-word matches (case-insensitive), but preserve original casing
      const regex = new RegExp(`\\b(${escapeRegex(word)})\\b`, 'gi');
      parts[i] = parts[i].replace(regex, (match) => `[[${match}]]`);
    }
  }

  return parts.join('');
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

module.exports = { chatToMarkdown, applyLinks };
