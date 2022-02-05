# Setup

- Check out the following three projects from github
  - [quizmd](https://github.com/bayhiker/quizmd.git): Javascript library for using markdown syntax to write quizzes
  - [markdown-it-quizmd](https://github.com/bayhiker/markdown-it-quizmd.git): Markdown-it plugin for processing quizmd snippets in markdown
  - [vscode-extension-markdown-quizmd](https://github.com/bayhiker/vscode-extension-markdown-quizmd.git): This is the VS Code extension
- Update markdown-it-quizmd project to use local quizmd code:
  - `npm uninstall quizmd`
  - `npm install ../quizmd/dist`
- Update vscode-extension-markdown-quizmd project to use local markdown-it-quizmd and local quizmd code:
  - `npm uninstall markdown-it-quizmd`
  - `npm install ../markdown-it-quizmd`

# Debugging VS Code Extension

If you make updates in quizmd project, the following steps are needed to make sure vscode-extension-markdown-quizmd project uses your most recent changes:

- In quizmd folder, run `npm run build`
- In markdown-it-quizmd folder, run `npm run build`
- In vscode-extension-markdown-quizmd, stop debug VS Code window if it is already running, then restart debugging by pressing F5 key.
