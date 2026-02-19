**Visualize patterns in your thinking with AI chatbots.**

ClaudeArchive exports your Claude.ai conversations into an Obsidian vault with automatic hyperlinks, building a searchable map of your AI-assisted thinking over time. You will be able to see patterns within and across chats. The app also offers chat management features like deletion and customizable export settings. Each export will output a report with chat summaries and keyword frequencies. Watch your web grow over time! **Use with caution.**

Known bug: a bit aggressive with converting plurals into singulars. The stop word database is also being expanded.

<img width="1112" height="623" alt="Screenshot 2026-02-15 at 12 28 02 PM" src="https://github.com/user-attachments/assets/d9860c1f-b5c5-4a4b-93ae-1694e6e940bb" />

App interface

<img width="926" height="838" alt="Screenshot 2026-02-18 at 11 47 23 PM" src="https://github.com/user-attachments/assets/6fcf08cf-6634-4a6b-9778-a221f9ca6d4a" />

Graph of 20+ chats, each frequent keyword is a node, bigger nodes mean more connections. Blue = chat, Red = export report

<img width="834" height="582" alt="Screenshot 2026-02-18 at 11 52 49 PM" src="https://github.com/user-attachments/assets/66ce23fc-309d-451d-ba02-df694f09410e" />

Focus on one keyword, showing connections to chats mentioned in

<img width="729" height="499" alt="Screenshot 2026-02-15 at 12 47 46 PM" src="https://github.com/user-attachments/assets/be505157-1e4e-413f-80d9-642c9b377f02" />

Example of a hyperlinked chat with connections

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
   git clone https://github.com/quackiess/claude-archive.git
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
