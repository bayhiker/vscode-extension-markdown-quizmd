// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from "vscode";
// import * as myExtension from '../../extension';

suite("Exporter Test Suite", () => {
  vscode.window.showInformationMessage("Start all tests.");

  test("exportPdf, with non markdown content", () => {
    const editor = this.vscode.window.activeTextEditor;
    const mode = editor?.document.languageId;
  });
});
