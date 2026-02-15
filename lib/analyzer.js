// Comprehensive stop words: English grammar words + conversational filler common in AI chats
const STOP_WORDS = new Set([
  // articles, prepositions, conjunctions, pronouns
  'the', 'a', 'an', 'and', 'or', 'but', 'nor', 'for', 'yet', 'so',
  'in', 'on', 'at', 'to', 'of', 'by', 'with', 'from', 'up', 'out',
  'into', 'onto', 'off', 'over', 'under', 'above', 'below', 'between',
  'through', 'during', 'before', 'after', 'about', 'against', 'along',
  'among', 'around', 'within', 'without', 'toward', 'towards', 'upon',
  'i', 'me', 'my', 'mine', 'myself', 'you', 'your', 'yours', 'yourself',
  'he', 'him', 'his', 'himself', 'she', 'her', 'hers', 'herself',
  'it', 'its', 'itself', 'we', 'us', 'our', 'ours', 'ourselves',
  'they', 'them', 'their', 'theirs', 'themselves',
  'this', 'that', 'these', 'those', 'who', 'whom', 'whose', 'which', 'what',
  // verbs (common/auxiliary)
  'be', 'is', 'am', 'are', 'was', 'were', 'been', 'being',
  'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing', 'done',
  'will', 'would', 'shall', 'should', 'may', 'might', 'must', 'can', 'could',
  'get', 'got', 'getting', 'gets', 'go', 'goes', 'went', 'going', 'gone',
  'make', 'makes', 'made', 'making', 'take', 'takes', 'took', 'taking', 'taken',
  'come', 'comes', 'came', 'coming', 'give', 'gives', 'gave', 'giving', 'given',
  'say', 'says', 'said', 'saying', 'know', 'knows', 'knew', 'knowing', 'known',
  'think', 'thinks', 'thought', 'thinking', 'see', 'sees', 'saw', 'seeing', 'seen',
  'want', 'wants', 'wanted', 'wanting', 'look', 'looks', 'looked', 'looking',
  'use', 'uses', 'used', 'using', 'find', 'finds', 'found', 'finding',
  'put', 'puts', 'putting', 'tell', 'tells', 'told', 'telling',
  'ask', 'asks', 'asked', 'asking', 'work', 'works', 'worked', 'working',
  'call', 'calls', 'called', 'calling', 'try', 'tries', 'tried', 'trying',
  'need', 'needs', 'needed', 'needing', 'keep', 'keeps', 'kept', 'keeping',
  'let', 'lets', 'set', 'sets', 'run', 'runs', 'ran', 'running',
  'show', 'shows', 'showed', 'showing', 'shown',
  'move', 'moves', 'moved', 'moving', 'turn', 'turns', 'turned', 'turning',
  'start', 'starts', 'started', 'starting', 'seem', 'seems', 'seemed', 'seeming',
  'leave', 'leaves', 'left', 'leaving', 'play', 'plays', 'played', 'playing',
  'mean', 'means', 'meant', 'meaning', 'end', 'ends', 'ended', 'ending',
  // adverbs, adjectives, fillers
  'not', 'no', 'yes', 'just', 'also', 'very', 'often', 'here', 'there',
  'when', 'where', 'why', 'how', 'all', 'each', 'every', 'both', 'few',
  'more', 'most', 'other', 'some', 'such', 'only', 'own', 'same', 'than',
  'too', 'then', 'now', 'well', 'way', 'even', 'new', 'still', 'already',
  'back', 'much', 'many', 'any', 'first', 'last', 'long', 'great', 'little',
  'right', 'good', 'big', 'small', 'high', 'low', 'old', 'young',
  'next', 'early', 'far', 'able', 'like', 'one', 'two', 'three',
  'really', 'actually', 'basically', 'simply', 'quite', 'rather', 'pretty',
  'sure', 'always', 'never', 'sometimes', 'again', 'once', 'ever',
  'down', 'else', 'though', 'although', 'whether', 'because', 'since',
  'while', 'if', 'so', 'until', 'unless',
  // conversational / AI-chat filler
  'okay', 'yeah', 'hey', 'thanks', 'thank', 'please', 'sorry',
  'thing', 'things', 'something', 'anything', 'everything', 'nothing',
  'someone', 'anyone', 'everyone', 'nobody',
  'point', 'part', 'place', 'case', 'fact', 'example', 'question',
  'answer', 'number', 'kind', 'sort', 'type', 'lot', 'bit',
  'day', 'time', 'year', 'people', 'person', 'world', 'life',
  'hand', 'side', 'head', 'home', 'room', 'area',
  'important', 'different', 'possible', 'likely', 'certain', 'specific',
  'general', 'common', 'similar', 'various', 'several', 'entire',
  'however', 'therefore', 'furthermore', 'moreover', 'additionally',
  'essentially', 'particularly', 'especially', 'generally', 'typically',
  'usually', 'certainly', 'probably', 'perhaps', 'maybe', 'simply',
  'clearly', 'obviously', 'definitely', 'absolutely', 'completely',
  'note', 'consider', 'provide', 'include', 'involve', 'require',
  'understand', 'explain', 'describe', 'mention', 'refer', 'relate',
  'create', 'follow', 'change', 'help', 'add', 'also',
  // contractions leftovers
  'don', 'didn', 'doesn', 'won', 'isn', 'aren', 'wasn',
  'weren', 'hasn', 'haven', 'hadn', 'couldn', 'wouldn', 'shouldn', 'mustn',
  'can', 'could', 'll', 've', 're',
]);

function extractWords(text) {
  return text
    .toLowerCase()
    .replace(/```[\s\S]*?```/g, '') // remove code blocks
    .replace(/`[^`]+`/g, '')        // remove inline code
    .replace(/https?:\/\/\S+/g, '') // remove URLs
    .replace(/[^a-z\s'-]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && !STOP_WORDS.has(w));
}

function getWordFrequencies(text) {
  const words = extractWords(text);
  const freq = {};
  for (const word of words) {
    freq[word] = (freq[word] || 0) + 1;
  }
  return { frequencies: freq, totalWords: words.length };
}

// linkPercent: top N% of unique words get linked (e.g. 15 = top 15%)
// Also accepts an optional Set of cross-chat terms that always get linked
function getLinkedWords(text, linkPercent, crossChatTerms) {
  const { frequencies, totalWords } = getWordFrequencies(text);
  const sorted = Object.entries(frequencies).sort((a, b) => b[1] - a[1]);

  // Pick the top N% of unique words (at least 3 words)
  const uniqueCount = sorted.length;
  const cutoff = Math.max(3, Math.ceil(uniqueCount * (linkPercent / 100)));
  const topWords = sorted.slice(0, cutoff);

  const linked = topWords.map(([word, count]) => ({
    word, count, percentage: ((count / totalWords) * 100).toFixed(2),
  }));

  // Merge in cross-chat terms that appear in this text but didn't make the top cut
  if (crossChatTerms) {
    const linkedSet = new Set(linked.map(w => w.word));
    for (const term of crossChatTerms) {
      if (!linkedSet.has(term) && frequencies[term]) {
        linked.push({
          word: term,
          count: frequencies[term],
          percentage: ((frequencies[term] / totalWords) * 100).toFixed(2),
        });
      }
    }
  }

  return linked.sort((a, b) => b.count - a.count);
}

// Analyze multiple chats together and return terms that appear in 2+ chats
function getCrossChatTerms(chats, linkPercent) {
  // Count in how many chats each word appears
  const chatPresence = {};
  for (const chat of chats) {
    const messages = chat.chat_messages || [];
    let text = '';
    for (const msg of messages) {
      text += extractMessageText(msg) + ' ';
    }
    const { frequencies } = getWordFrequencies(text);
    const sorted = Object.entries(frequencies).sort((a, b) => b[1] - a[1]);
    // Get the top words from this chat
    const cutoff = Math.max(3, Math.ceil(sorted.length * (linkPercent / 100)));
    const topWords = sorted.slice(0, cutoff);
    const seen = new Set();
    for (const [word] of topWords) {
      if (!seen.has(word)) {
        seen.add(word);
        chatPresence[word] = (chatPresence[word] || 0) + 1;
      }
    }
  }
  // Return words present in 2+ chats — these are the cross-connections
  const shared = new Set();
  for (const [word, count] of Object.entries(chatPresence)) {
    if (count >= 2) shared.add(word);
  }
  return shared;
}

function extractTopics(allFrequencies) {
  // Group related high-frequency words into topics
  const sorted = Object.entries(allFrequencies)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 30);

  return sorted.map(([word, count]) => ({ word, count }));
}

function generateReport(exportedChats, date, linkPercent, crossChatTerms) {
  let allText = '';
  let totalMessages = 0;
  const chatLinks = [];

  for (const chat of exportedChats) {
    const messages = chat.chat_messages || [];
    totalMessages += messages.length;
    for (const msg of messages) {
      allText += extractMessageText(msg) + ' ';
    }
    const title = chat.name || chat.uuid || 'Untitled';
    const fileName = sanitizeFileName(title, chat.created_at || date);
    chatLinks.push({ title, fileName });
  }

  const { frequencies, totalWords } = getWordFrequencies(allText);
  const topics = extractTopics(frequencies);
  const sorted = Object.entries(frequencies).sort((a, b) => b[1] - a[1]);
  const cutoff = Math.max(3, Math.ceil(sorted.length * (linkPercent / 100)));
  const topLinked = sorted.slice(0, cutoff);
  const topWords = sorted.slice(0, 50);

  let report = `---\ntype: report\ndate: ${date}\nchats_exported: ${exportedChats.length}\ntotal_messages: ${totalMessages}\ntotal_words: ${totalWords}\nlink_percent: ${linkPercent}%\n---\n\n`;
  report += `# Export Report — ${date}\n\n`;

  report += `## Stats\n\n`;
  report += `| Metric | Value |\n|--------|-------|\n`;
  report += `| Chats Exported | ${exportedChats.length} |\n`;
  report += `| Total Messages | ${totalMessages} |\n`;
  report += `| Total Words (after filtering) | ${totalWords} |\n`;
  report += `| Link Coverage | Top ${linkPercent}% of unique words |\n`;
  report += `| Words Linked | ${topLinked.length} |\n`;
  report += `| Cross-Chat Terms | ${crossChatTerms ? crossChatTerms.size : 0} |\n\n`;

  report += `## Exported Chats\n\n`;
  for (const link of chatLinks) {
    report += `- [[${link.fileName}|${link.title}]]\n`;
  }
  report += '\n';

  if (crossChatTerms && crossChatTerms.size > 0) {
    report += `## Cross-Chat Connections\n\n`;
    report += `These terms appeared as top words in multiple chats, creating links between them:\n\n`;
    for (const term of crossChatTerms) {
      const count = frequencies[term] || 0;
      report += `- [[${term}]] (${count} total mentions)\n`;
    }
    report += '\n';
  }

  report += `## Word Frequency (Top 50)\n\n`;
  report += `| Rank | Word | Count | % | Linked? |\n|------|------|-------|---|--------|\n`;
  const linkedSet = new Set(topLinked.map(([w]) => w));
  topWords.forEach(([word, count], i) => {
    const pct = ((count / totalWords) * 100).toFixed(2);
    const isLinked = linkedSet.has(word) || (crossChatTerms && crossChatTerms.has(word));
    const display = isLinked ? `[[${word}]]` : word;
    report += `| ${i + 1} | ${display} | ${count} | ${pct}% | ${isLinked ? 'yes' : ''} |\n`;
  });
  report += '\n';

  report += `## Topics Summary\n\n`;
  const topTopics = topics.slice(0, 15);
  for (const topic of topTopics) {
    report += `- **${topic.word}** (${topic.count} mentions)\n`;
  }
  report += '\n';

  report += `## Key Takeaways\n\n`;
  report += `- ${exportedChats.length} conversation(s) archived on ${date}\n`;
  if (topTopics.length > 0) {
    report += `- Primary focus areas: ${topTopics.slice(0, 5).map(t => t.word).join(', ')}\n`;
  }
  if (crossChatTerms && crossChatTerms.size > 0) {
    report += `- ${crossChatTerms.size} term(s) bridge multiple conversations: ${Array.from(crossChatTerms).slice(0, 10).join(', ')}\n`;
  }
  report += '\n';

  return report;
}

function extractMessageText(msg) {
  if (typeof msg.text === 'string') return msg.text;
  if (Array.isArray(msg.content)) {
    return msg.content
      .filter(c => c.type === 'text')
      .map(c => c.text)
      .join('\n');
  }
  if (typeof msg.content === 'string') return msg.content;
  return '';
}

function sanitizeFileName(title, dateStr) {
  const date = dateStr ? dateStr.split('T')[0] : new Date().toISOString().split('T')[0];
  const safe = (title || 'Untitled')
    .replace(/[^a-zA-Z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 80);
  return `${date}_${safe}`;
}

module.exports = {
  STOP_WORDS,
  extractWords,
  getWordFrequencies,
  getLinkedWords,
  getCrossChatTerms,
  extractTopics,
  generateReport,
  extractMessageText,
  sanitizeFileName,
};
