import { Menu, Tray } from "electron";
import * as path from "path";

export function createTray(app: Electron.App): Electron.Tray {
  const tray = new Tray(path.resolve(__dirname, "../../public/icon.ico"));
  const contextMenu = Menu.buildFromTemplate([
    { label: "Sync", type: "checkbox", checked: true, enabled: false },
    { label: "Listening on port 12536", enabled: false },
    { type: "separator" },
    { label: "Home Cloud v0.0.1", enabled: false },
    { type: "separator" },
    {
      label: "Quit",
      click() {
        app.quit();
      },
    },
  ]);
  tray.setToolTip("Home Cloud");
  tray.setContextMenu(contextMenu);

  return tray;
}
