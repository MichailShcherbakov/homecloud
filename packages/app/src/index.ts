import { app } from "electron";
import { bootstrap, shutdown } from "./app";
import { createTray } from "./tray";

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  // eslint-disable-line global-require
  app.quit();
}

app.on("ready", async () => {
  console.log("App is starting...");

  createTray(app);

  await bootstrap();

  console.log("App is started.");
});

app.on("quit", async () => {
  console.log("App is closing...");

  await shutdown();

  console.log("App is closed.");
});
