import {
  fileExists,
  dirExists,
  showErrorMessage,
  setProxy,
  showInfoMessage,
  setStatusBarMessage,
  getDecoratedMd,
  getRandomDigits,
} from "./util";
import * as vscode from "vscode";
import {
  getExecutablePath,
  getExportDirectory,
  getPdfDisplayHeaderFooter,
  getPdfFooterTemplate,
  getPdfFormat,
  getPdfHeaderTemplate,
  getPdfHeight,
  getPdfMargin,
  getPdfOrientation,
  getPdfPageRanges,
  getPdfPrintBackground,
  getPdfScale,
  getPdfWidth,
} from "./settings";

export default class Exporter {
  // handle to vscode
  vscode: any;
  static chromiumFound = false;

  constructor() {}

  async exportQuiz(exportType: string = "pdf", isSolution: boolean = false) {
    if (exportType !== "pdf") {
      showErrorMessage(`Only pdf export is supported`);
      return;
    }
    const path = require("path");
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      showErrorMessage(`No active editor`);
      return;
    }
    const mode = editor?.document.languageId;
    if (mode !== "markdown") {
      showErrorMessage(
        `Cannot export non-markdown file ${editor?.document.fileName || ""}`
      );
      return;
    }
    const chromiumPath = Exporter.getChromiumPath();
    if (!chromiumPath) {
      showErrorMessage(`No chromium installation found`);
      return;
    }
    const documentPath = editor?.document.fileName;
    console.log(`Converting ${documentPath} to ${exportType}`);
    const documentBasename = path.basename(documentPath, ".md");
    const tempHtmlPath = path.join(
      require("os").tmpdir(),
      `quizmd-tmp-${getRandomDigits()}.html`
    );
    const exportedFilename = documentPath
      ? documentPath.replace(
          /md$/,
          `${isSolution ? "solution." : ""}${exportType}`
        )
      : path.join(
          getExportDirectory(),
          `${documentBasename}${
            isSolution ? "-solutions" : ""
          }-${getRandomDigits()}.${exportType}`
        );
    // Write html to a temp file
    const fs = require("fs");
    const html = Exporter.md2html(
      getDecoratedMd(),
      editor?.document.getText(),
      isSolution
    );
    fs.writeFileSync(tempHtmlPath, html, (error: Error) => {
      if (error) {
        showErrorMessage(
          `Failed to write temp HTML file ${exportedFilename}: ${error}`
        );
      } else {
        console.debug(`Saved ${exportedFilename}`);
      }
    });

    return vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: `Exporting ${exportType}...`,
      },
      async () => {
        try {
          const puppeteer = require("puppeteer-core");
          const browser = await puppeteer.launch({
            executablePath: chromiumPath,
            args: [
              "--lang=" + vscode.env.language,
              "--no-sandbox",
              "--disable-setuid-sandbox",
            ],
          });
          const page = await browser.newPage();
          await page.goto(vscode.Uri.file(tempHtmlPath).toString(), {
            waitUntil: "networkidle0",
          });
          const pdfOptions = {
            path: exportedFilename,
            scale: getPdfScale(),
            displayHeaderFooter: getPdfDisplayHeaderFooter(),
            headerTemplate: getPdfHeaderTemplate(),
            footerTemplate: getPdfFooterTemplate(),
            printBackground: getPdfPrintBackground(),
            landscape: getPdfOrientation() === "landscape",
            pageRanges: getPdfPageRanges(),
            format: getPdfFormat(),
            width: getPdfWidth(),
            height: getPdfHeight(),
            margin: getPdfMargin(),
          };
          await page.pdf(pdfOptions);
          await browser.close();

          showInfoMessage(`Exported pdf: ${exportedFilename}`);
        } catch (error: any) {
          showErrorMessage(`Failed to export PDF: ${error.toString()}`);
        } finally {
          // delete temporary file
          if (fileExists(tempHtmlPath)) {
            fs.unlinkSync(tempHtmlPath);
          }
        }
      } // async
    ); // vscode.window.withProgress
  }

  static md2html(md: any, text: string, isSolution: boolean = false) {
    const solutionCss = `
<style>
.quizmd-multiple-choice-solution {
  color: red;
  font-weight: bold;
}
</style>

    `;
    return `
<html>
  <head>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.15.2/dist/katex.min.css" integrity="sha384-MlJdn/WNKDGXveldHDdyRP1R4CTHr3FeuDNfhsLPYrq2t0UBkUdK2jyTnXPEK1NQ" crossorigin="anonymous">

    <!-- The loading of KaTeX is deferred to speed up page rendering -->
    <script defer src="https://cdn.jsdelivr.net/npm/katex@0.15.2/dist/katex.min.js" integrity="sha384-VQ8d8WVFw0yHhCk5E8I86oOhv48xLpnDZx5T9GogA/Y84DcCKWXDmSDfn13bzFZY" crossorigin="anonymous"></script>

    <!-- To automatically render math in text elements, include the auto-render extension: -->
    <script defer src="https://cdn.jsdelivr.net/npm/katex@0.15.2/dist/contrib/auto-render.min.js" integrity="sha384-+XBljXPPiv+OzfbB3cVmLHf4hdUFHlWNZN5spNQ7rmHTXpd7WvJum6fIACpNNfIR" crossorigin="anonymous"
        onload="renderMathInElement(document.body);"></script>
    ${isSolution ? solutionCss : ""}
  </head>
  <body>
  ${md.render(text)}
  </body>
</html>
    `;
  }

  static getChromiumPath(): string {
    try {
      // settings.json
      var executablePath = getExecutablePath();
      if (fileExists(executablePath)) {
        Exporter.chromiumFound = true;
        return executablePath;
      }

      // bundled Chromium
      const puppeteer = require("puppeteer-core");
      executablePath = puppeteer.executablePath();
      if (fileExists(executablePath)) {
        return executablePath;
      } else {
        return "";
      }
    } catch (error) {
      showErrorMessage("checkPuppeteerBinary()");
      return "";
    }
  }

  static installChromium() {
    const path = require("path");
    try {
      const installMessage = "$(markdown) Installing Chromium ...";
      showInfoMessage(installMessage);
      const statusBarMessage = setStatusBarMessage(installMessage);
      setProxy();
      const puppeteer = require("puppeteer-core");
      const browserFetcher = puppeteer.createBrowserFetcher();
      // This revision matches puppeteer version 13.1.x
      // https://github.com/puppeteer/puppeteer/releases
      const revisionInfo = browserFetcher.revisionInfo("950341");

      // download Chromium
      browserFetcher
        .download(revisionInfo.revision, onProgress)
        .then(() => browserFetcher.localRevisions())
        .then(onSuccess)
        .catch(onError);

      function onSuccess(localRevisions: Array<any>) {
        console.log("Chromium downloaded to " + revisionInfo.folderPath);
        const oldRevisions = localRevisions.filter(
          (revision) => revision !== revisionInfo.revision
        );
        // Remove previous chromium revisions.
        const cleanupOldVersions = oldRevisions.map((revision) =>
          browserFetcher.remove(revision)
        );

        if (Exporter.getChromiumPath()) {
          Exporter.chromiumFound = true;
          statusBarMessage.dispose();
          setStatusBarMessage("$(markdown) Chromium installation succeeded!");
          showInfoMessage("[Markdown QuizMD] Chromium installation succeeded.");
          return Promise.all(cleanupOldVersions);
        }
      }

      function onError(error: Error) {
        statusBarMessage.dispose();
        setStatusBarMessage("$(markdown) ERROR: Failed to download Chromium!");
        showErrorMessage(
          `Failed to download Chromium:${error.toString()}.
          If you are behind a proxy, set the http.proxy option to settings.json
          and restart Visual Studio Code.
          See https://github.com/bayhiker/vscode-extension-markdown-quizmd#install`
        );
      }

      function onProgress(downloadedBytes: number, totalBytes: number) {
        var progress = Math.round((downloadedBytes / totalBytes) * 100);
        setStatusBarMessage(
          "$(markdown) Installing Chromium " + progress + "%"
        );
      }
    } catch (error: any) {
      showErrorMessage(`Failed to install Chromium: ${error.toString()}`);
    }
  }
}
