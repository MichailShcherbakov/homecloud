import { BrowserWindow, shell } from "electron";
import { join } from "path";

export async function createWindow(app: Electron.App) {
  const url = process.env.VITE_DEV_SERVER_URL;
  const indexHtml = join(process.env.DIST, "index.html");

  const win = new BrowserWindow({
    title: "HomeCloud",
    width: 1280,
    height: 720,
    minWidth: 1280,
    minHeight: 720,
    icon: join(process.env.PUBLIC, "favicon.svg"),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  if (app.isPackaged) {
    win.loadFile(indexHtml, {
      hash: "/",
    });
  } else {
    win.loadURL(url);
    win.webContents.openDevTools();
  }

  // Test actively push message to the Electron-Renderer
  win.webContents.on("did-finish-load", () => {
    win?.webContents.send("main-process-message", new Date().toLocaleString());
  });

  // Make all links open with the browser, not with the application
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("https:")) shell.openExternal(url);
    return { action: "deny" };
  });
}
