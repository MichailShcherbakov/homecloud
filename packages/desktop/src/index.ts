import { HttpServer } from "@nestjs/common";
import { app } from "electron";
import { bootstrap, shutdown } from "./app";
import { Converter } from "./modules/converter";
import { createTray, LAUNCH_STATUS_INDEX } from "./tray";

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  app.quit();
}

let server: HttpServer | null = null;

app.on("ready", async () => {
  console.log("App is starting...");

  const { updateTray } = createTray(app);

  const api = await bootstrap();

  /// sync and convert files stage
  const converter = api.get<Converter>(Converter);

  let convertedFilesAmount = 0;

  converter.on(
    "start",
    ({ shouldToBeConvertedAmount }: { shouldToBeConvertedAmount: number }) => {
      console.log(
        "[Start]",
        `Convert: ${convertedFilesAmount}/${shouldToBeConvertedAmount}`
      );

      updateTray(menu => {
        menu.items[
          LAUNCH_STATUS_INDEX
        ].label = `Converted: ${convertedFilesAmount}/${shouldToBeConvertedAmount}`;
        menu.items[LAUNCH_STATUS_INDEX].checked = false;
      });
    }
  );

  converter.on(
    "done",
    ({ shouldToBeConvertedAmount }: { shouldToBeConvertedAmount: number }) => {
      updateTray(menu => {
        menu.items[
          LAUNCH_STATUS_INDEX
        ].label = `Converted: ${++convertedFilesAmount}/${
          shouldToBeConvertedAmount + convertedFilesAmount - 1
        }`;
        menu.items[LAUNCH_STATUS_INDEX].checked = false;
      });

      console.log(
        "[Done]",
        `Converted: ${convertedFilesAmount}/${shouldToBeConvertedAmount}`
      );

      if (!shouldToBeConvertedAmount) {
        convertedFilesAmount = 0;

        updateTray(menu => {
          menu.items[LAUNCH_STATUS_INDEX].label = "Started";
          menu.items[LAUNCH_STATUS_INDEX].checked = true;
        });
      }
    }
  );

  converter.on("end", async () => {
    if (!server) server = await api.listen(12536);

    updateTray(menu => {
      menu.items[LAUNCH_STATUS_INDEX].label = "Started";
      menu.items[LAUNCH_STATUS_INDEX].checked = true;
    });

    console.log("App is started.");
  });

  await converter.run();
});

app.on("quit", async () => {
  console.log("App is closing...");

  await shutdown();

  console.log("App is closed.");
});

export const viteNodeApp = app;
