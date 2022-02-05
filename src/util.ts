import * as vscode from "vscode";
import { getStatusBarMessageTimeout } from "./settings";

export function fileExists(path: string): boolean {
  const fs = require("fs");
  try {
    return fs.existsSync(path);
  } catch (err) {
    return false;
  }
}

export function dirExists(path: string): boolean {
  const fs = require("fs");
  if (fileExists(path)) {
    return fs.lstatSync(path).isDirectory();
  }
  return false;
}

export function showInfoMessage(info: string): void {
  const infoMessage = `[INFO] ${info}`;
  vscode.window.showInformationMessage(infoMessage);
  console.log(infoMessage);
}

export function showErrorMessage(error: string | Error): void {
  const errorMessage = `[ERROR] ${error}`;
  vscode.window.showErrorMessage(errorMessage);
  console.error(errorMessage);
}

export function setProxy() {
  const httpsProxy = vscode.workspace.getConfiguration("http")["proxy"] || "";
  if (httpsProxy) {
    process.env.HTTPS_PROXY = httpsProxy;
    process.env.HTTP_PROXY = httpsProxy;
  }
}

export function setStatusBarMessage(
  statusBarMessage: string
): vscode.Disposable {
  const statusBarMessageTimeout = getStatusBarMessageTimeout();
  return vscode.window.setStatusBarMessage(statusBarMessage, 10000);
}

export function getDecoratedMd(md: any = undefined): any {
  // Use all vs code markdown-it plugins here
  if (!md) {
    md = require("markdown-it")({ html: true });
  }
  return md.use(require("markdown-it-quizmd"));
}

export function getRandomDigits(max: number = 1000000) {
  return Math.floor(Math.random() * 1000000);
}
