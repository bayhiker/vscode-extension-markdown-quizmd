// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import * as mdItContainer from "markdown-it-container";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Extension "markdown-quizmd" is active!');

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand(
    "markdown-quizmd.about",
    () => {
      // The code you place here will be executed every time your command is executed
      // Display a message box to the user
      vscode.window.showInformationMessage(
        "markdown-quizmd plugin QuizMD authoring support to VS Code built-in markdown preview"
      );
    }
  );

  context.subscriptions.push(disposable);

  return {
    extendMarkdownIt(md: any) {
      return md.use(require("markdown-it-quizmd"));
    },
  };
}

// this method is called when your extension is deactivated
export function deactivate() {}