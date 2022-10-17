import { app } from "electron";
import { bootstrap, shutdown } from "./app";
import { Converter } from "./modules/converter";
import { createTray, LAUNCH_STATUS_INDEX } from "./tray";

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  app.quit();
}

app.on("ready", async () => {
  console.log("App is starting...");

  const { updateTray } = createTray(app);

  const server = await bootstrap();

  /// sync and convert files stage
  const converter = server.get<Converter>(Converter);

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
      });

      console.log(
        "[Done]",
        `Converted: ${convertedFilesAmount}/${shouldToBeConvertedAmount}`
      );

      if (!shouldToBeConvertedAmount) {
        convertedFilesAmount = 0;
      }
    }
  );

  converter.on("end", () => {
    /* await server.listen(12536); */

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
