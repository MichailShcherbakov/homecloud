import { Job } from "@/server/modules/queue";
import { WatcherWorker, WatcherWorkerJobData } from "../watcher.worker";
import { Logger } from "@nestjs/common";
import { mockedWatcherInstance } from "./__mocks__/watcher.instance";
import { mockedMetadataService } from "./__mocks__/metadata.service";
import { Mock } from "./__mocks__";
import { MetadataService, WatcherEventEnum, WatcherInstance } from "..";
import { faker } from "@faker-js/faker";

describe("[Watcher Module] ...", () => {
  let watcherWorker: WatcherWorker;

  beforeEach(() => {
    watcherWorker = new WatcherWorker(
      Mock<Logger>({}),
      Mock<MetadataService>(mockedMetadataService)
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("[Watcher Worker] ...", () => {
    it("should emit 'create' event when entity is created", async () => {
      const directoryPath = faker.system.directoryPath();
      const metadata = {
        ino: faker.datatype.string(),
        path: faker.system.directoryPath(),
        size: 0,
        isFile: false,
        isDirectory: true,
      };

      const job = new Job<WatcherWorkerJobData>({
        watcher: Mock<WatcherInstance>(mockedWatcherInstance),
        events: [
          {
            type: "create",
            path: directoryPath,
          },
        ],
        shouldEmitEvents: true,
      });

      mockedMetadataService.set.mockResolvedValueOnce(metadata);

      await watcherWorker.onFileSystemEvent(job);

      expect(mockedWatcherInstance.signal).toHaveBeenCalledWith(
        WatcherEventEnum.ON_DIR_ADDED,
        directoryPath,
        metadata
      );
    });
  });
});
