import { Menu, Tray } from "electron";
import * as path from "path";

export const LAUNCH_STATUS_INDEX = 0;

export function createTray(app: Electron.App) {
  const tray = new Tray(path.resolve(__dirname, "../../public/icon.ico"));
  let contextMenu = Menu.buildFromTemplate([
    { label: "Starting...", type: "checkbox", enabled: false, checked: false },
    { type: "separator" },
    { label: "Disconnected", enabled: false },
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

  return {
    updateTray(update: (menu: Menu) => void) {
      update(contextMenu);

      contextMenu = Menu.buildFromTemplate(contextMenu.items);

      tray.setContextMenu(contextMenu);
    },
  };
}
