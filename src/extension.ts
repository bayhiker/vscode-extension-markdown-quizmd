// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import Exporter from "./exporter";
import { convertOnSave } from "./settings";
import { getDecoratedMd, showErrorMessage, showInfoMessage } from "./util";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Extension "markdown-quizmd" is active!');
  init();

  const exporter = new Exporter();

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  const commands = [
    vscode.commands.registerCommand(
      "extension.markdown-quizmd.about",
      async function () {
        await about();
      }
    ),
    vscode.commands.registerCommand(
      "extension.markdown-quizmd.export2pdf",
      async function () {
        await exporter.exportQuiz("pdf");
        await exporter.exportQuiz("pdf", true);
      }
    ),
  ];
  commands.forEach((command) => {
    context.subscriptions.push(command);
  });
  // Handle event subscriptions such as convertOnSave
  const subscriptions = [];
  if (convertOnSave()) {
    subscriptions.push(
      vscode.workspace.onDidSaveTextDocument(async () => {
        await exporter.exportQuiz("pdf");
        await exporter.exportQuiz("pdf", true);
      })
    );
  }
  subscriptions.forEach((subscription) => {
    context.subscriptions.push(subscription);
  });

  return {
    extendMarkdownIt(md: any) {
      return getDecoratedMd(md);
    },
  };
}

async function about() {
  showInfoMessage("Add QuizMD authoring support to VS Code markdown preview");
}

function init() {
  try {
    if (Exporter.getChromiumPath()) {
      console.debug(
        `chromium installation found at ${Exporter.getChromiumPath()}`
      );
      Exporter.chromiumFound = true;
    } else {
      Exporter.installChromium();
      console.debug(`chromium installed at ${Exporter.getChromiumPath()}`);
    }
  } catch (error: any) {
    showErrorMessage(`Error initializing Markdown QuizMD: ${error.toString()}`);
  }
}

// this method is called when your extension is deactivated
export function deactivate() {}
