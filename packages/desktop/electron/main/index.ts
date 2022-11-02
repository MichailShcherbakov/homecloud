// The built directory structure
//
// ├─┬ dist-electron
// │ ├─┬ main
// │ │ └── index.js    > Electron-Main
// │ └─┬ preload
// │   └── index.js    > Preload-Scripts
// ├─┬ dist
// │ └── index.html    > Electron-Renderer
//
process.env.DIST_ELECTRON = join(__dirname, "../..");
process.env.DIST = join(process.env.DIST_ELECTRON, "../renderer");
process.env.PUBLIC = app.isPackaged
  ? process.env.DIST
  : join(process.env.DIST_ELECTRON, "../public");

import { app, BrowserWindow } from "electron";
import { release } from "os";
import { join } from "path";

import { createWindow } from "./createWindow";
import { Logger } from "@nestjs/common";
import { createServer, IServer } from "@server/createServer";

let server: IServer;
let logger: Logger;

// Disable GPU Acceleration for Windows 7
if (release().startsWith("6.1")) app.disableHardwareAcceleration();

// Set application name for Windows 10+ notifications
if (process.platform === "win32") app.setAppUserModelId(app.getName());

if (!app.requestSingleInstanceLock()) {
  app.quit();
  process.exit(0);
}

let win: BrowserWindow | null = null;

app.whenReady().then(async () => {
  createWindow(app);

  server = await createServer();

  logger = server.get<Logger>(Logger);

  logger.log("Starting app...", "Launcher");

  await server.listen(12536);

  logger.log("The app is started.", "Launcher");
});

app.on("window-all-closed", () => {
  win = null;
  if (process.platform !== "darwin") app.quit();
});

app.on("second-instance", () => {
  if (win) {
    // Focus on the main window if the user tried to open another
    if (win.isMinimized()) win.restore();
    win.focus();
  }
});

app.on("activate", () => {
  const allWindows = BrowserWindow.getAllWindows();
  if (allWindows.length) {
    allWindows[0].focus();
  } else {
    createWindow(app);
  }
});

app.on("quit", async () => {
  logger.log("Closing the app...", "Launcher");

  await server.close();

  logger.log("The app is closed.", "Launcher");
});
