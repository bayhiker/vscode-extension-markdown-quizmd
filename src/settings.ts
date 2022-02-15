import * as vscode from "vscode";
import { dirExists } from "./util";

export function getSetting(settingName: string): any {
  return (
    vscode.workspace.getConfiguration("markdown-quizmd")[settingName] || ""
  );
}

export function getExecutablePath() {
  return getSetting("executablePath") || "";
}

export function getStatusBarMessageTimeout() {
  return getSetting("statusBarMessageTimeout");
}

export function getExportDirectory() {
  let exportDirectory = getSetting("exportDirectory");
  if (!exportDirectory) {
    const homeDir = require("os").homedir();
    exportDirectory = require("path").join(homeDir, "Downloads", "quizmd");
    if (!dirExists(exportDirectory)) {
      require("fs").mkdirSync(exportDirectory, { recursive: true });
    }
  }
  return exportDirectory;
}

export function convertOnSave(): boolean {
  return getSetting("convertOnSave");
}

export function getPdfScale(): number {
  return getSetting("pdfScale") || 1;
}

export function getPdfWidth(): string {
  return getSetting("pdfWidth") || "";
}

export function getPdfHeight() {
  return getSetting("pdfHeight") || "";
}

export function getPdfFormat() {
  const pdfWidth = getPdfWidth();
  const pdfHeight = getPdfHeight();
  if (!pdfHeight && !pdfWidth) {
    return getSetting("pdfFormat") || "Letter";
  }
  return "Letter";
}

export function getPdfOrientation() {
  return getSetting("pdfOrientation") || "landscape";
}

export function getPdfDisplayHeaderFooter() {
  return getSetting("pdfDisplayHeaderFooter") || "";
}

export function getPdfHeaderTemplate() {
  return getSetting("pdfHeaderTemplate") || "";
}

export function getPdfFooterTemplate() {
  return getSetting("pdfFooterTemplate") || "";
}

export function getPdfPrintBackground() {
  return getSetting("pdfPrintBackground");
}

export function getPdfPageRanges() {
  return getSetting("pdfPrintRanges") || "";
}

export function getPdfMargin() {
  return {
    top: getSetting("pdfMargin")["top"] || "",
    right: getSetting("pdfMargin")["right"] || "",
    bottom: getSetting("pdfMargin")["bottom"] || "",
    left: getSetting("pdfMargin")["left"] || "",
  };
}
