**Visualize patterns in your thinking.**

ClaudeArchive exports your Claude.ai conversations into an Obsidian vault with automatic hyperlinks, building a searchable map of your AI-assisted thinking over time. You will be able to see patterns within and across chats. The app also offers chat management features like deletion and customizable export settings. Each export will output a report with chat summaries and keyword frequencies. **Use with caution.**

Known bug: a bit aggressive with converting plurals into singulars. The stop word database is also being expanded.

Example: chat about cellular respiration and photosynthesis, the output would show connecting links between related keywords that show up in both conversations. You can adjust how many keywords it tracks to control the length and detail of the connections. These are only two chats; with more, you will be able to build a much bigger web!

<img width="1112" height="623" alt="Screenshot 2026-02-15 at 12 28 02 PM" src="https://github.com/user-attachments/assets/d9860c1f-b5c5-4a4b-93ae-1694e6e940bb" />
<img width="1490" height="900" alt="Screenshot 2026-02-15 at 12 40 56 PM" src="https://github.com/user-attachments/assets/5aed0ba3-85fa-40d6-b9f6-9c4bef56aadb" />
<img width="729" height="499" alt="Screenshot 2026-02-15 at 12 47 46 PM" src="https://github.com/user-attachments/assets/be505157-1e4e-413f-80d9-642c9b377f02" />

# ClaudeArchive

## Features

- Connect to Claude.ai using your session key
- Browse and select chats to export
- Export chats as Markdown files into your Obsidian vault
- Word frequency analysis with cross-chat term linking
- Delete chats from Claude.ai after exporting
- Configurable link percentage and custom stop words

## Installation

1. Clone the repo
   ```
   git clone https://github.com/your-username/claude-archive.git
   cd claude-archive
   ```
2. Install dependencies
   ```
   npm install
   ```
3. Start the server
   ```
   npm start
   ```
4. Open http://localhost:3000 in your browser

## Setup

1. Go to [claude.ai](https://claude.ai) and log in
2. Open your browser's developer tools (F12 or right-click > Inspect)
3. Go to **Application** (Chrome) or **Storage** (Firefox) > **Cookies** > `https://claude.ai`
4. Find the cookie named `sessionKey` and copy its value
5. Paste it into the app's setup page
6. Set your Obsidian vault path in settings

## License

MIT
