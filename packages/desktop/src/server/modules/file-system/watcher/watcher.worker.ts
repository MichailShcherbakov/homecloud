import { Logger } from "@nestjs/common";
import watcher from "@parcel/watcher";
import { ConfigService } from "../../config/config.service";
import { Job, OnJobFailed, Process, Processor } from "../../queue";
import { MetadataService } from "./metadata.service";
import { WATCHER_QUEUE_NAME } from "./watcher.constants";
import { WatcherEventEnum } from "./watcher.events";
import { WatcherInstance } from "./watcher.instance";
import { basename } from "path";
import { getParentDirInfo } from "@/server/utils/fs/getParentDirInfo";
import { toJSON } from "@/server/utils/format";

interface IAction {
  kind: string;
}

interface CreateAction extends IAction {
  kind: "create";
  toPath: string;
}

interface RenameAction extends IAction {
  kind: "rename";
  fromPath: string;
  toPath: string;
}

interface MoveAction extends IAction {
  kind: "move";
  fromPath: string;
  toPath: string;
}

interface DeleteAction extends IAction {
  kind: "delete";
  fromPath: string;
}

export interface WatcherWorkerJobData {
  watcher: WatcherInstance;
  events: watcher.Event[];
  shouldEmitEvents?: boolean;
}

@Processor(WATCHER_QUEUE_NAME)
export class WatcherWorker {
  private readonly moveSignals: Map<string, () => string> = new Map<
    string,
    () => string
  >();

  constructor(
    private readonly logger: Logger,
    private readonly config: ConfigService,
    private readonly metadataService: MetadataService
  ) {}

  @Process()
  async onFileSystemEvent(job: Job<WatcherWorkerJobData>): Promise<void> {
    const { watcher, events, shouldEmitEvents } = job.data;

    type Action = CreateAction | RenameAction | MoveAction | DeleteAction;

    const createEvents = events.filter(e => e.type === "create");
    const deleteEvents = events.filter(e => e.type === "delete");

    const mappedEvents = new Set<watcher.Event>();

    const actions = new Set<Action>();

    for (const createEvent of createEvents) {
      for (const deleteEvent of deleteEvents) {
        if (mappedEvents.has(deleteEvent)) continue;

        const newName = basename(createEvent.path);
        const oldName = basename(deleteEvent.path);

        const { path: newParentDirPath } = getParentDirInfo(createEvent.path);
        const { path: oldParentDirPath } = getParentDirInfo(deleteEvent.path);

        if (newParentDirPath === oldParentDirPath && newName !== oldName) {
          /// rename
          actions.add({
            kind: "rename",
            fromPath: deleteEvent.path,
            toPath: createEvent.path,
          });
        } else if (
          newParentDirPath !== oldParentDirPath &&
          newName === oldName
        ) {
          // move
          actions.add({
            kind: "move",
            fromPath: deleteEvent.path,
            toPath: createEvent.path,
          });
        } else {
          throw new Error(
            `Unknown event combination:\n ${toJSON([createEvent, deleteEvent])}`
          );
        }

        mappedEvents.add(createEvent);
        mappedEvents.add(deleteEvent);

        break;
      }

      if (mappedEvents.has(createEvent)) continue;

      /// create
      actions.add({
        kind: "create",
        toPath: createEvent.path,
      });
    }

    for (const deleteEvent of deleteEvents) {
      if (mappedEvents.has(deleteEvent)) continue;

      /// delete
      actions.add({
        kind: "delete",
        fromPath: deleteEvent.path,
      });
    }

    for (const action of actions) {
      if (action.kind === "create") {
        const newPath = action.toPath;

        const metadata = await this.metadataService.set(newPath);

        const moveSignal = this.moveSignals.get(metadata.ino);

        if (moveSignal) {
          const toPath = newPath;
          const fromPath = moveSignal();

          await this.metadataService.update(fromPath, toPath);

          if (!shouldEmitEvents) return;

          if (metadata.isFile) {
            watcher.signal(WatcherEventEnum.ON_FILE_MOVED, toPath, fromPath);
          }

          if (metadata.isDirectory) {
            watcher.signal(WatcherEventEnum.ON_DIR_MOVED, toPath, fromPath);
          }

          return;
        }

        const timeoutId = setTimeout(async () => {
          const toPath = newPath;

          this.moveSignals.delete(metadata.ino);

          if (!shouldEmitEvents) return;

          if (metadata.isFile) {
            watcher.signal(WatcherEventEnum.ON_FILE_ADDED, toPath);
          }

          if (metadata.isDirectory) {
            watcher.signal(WatcherEventEnum.ON_DIR_ADDED, toPath);
          }
        }, 150);

        this.moveSignals.set(metadata.ino, () => {
          const toPath = newPath;

          clearTimeout(timeoutId);

          this.moveSignals.delete(metadata.ino);

          return toPath;
        });
      } else if (action.kind === "delete") {
        const oldPath = action.fromPath;

        const metadata = await this.metadataService.get(oldPath);

        if (!metadata)
          throw new Error(`The metadata was not found: ${oldPath}`);

        const moveSignal = this.moveSignals.get(metadata.ino);

        if (moveSignal) {
          const fromPath = oldPath;
          const toPath = moveSignal();

          await this.metadataService.update(fromPath, toPath);

          if (!shouldEmitEvents) return;

          if (metadata.isFile) {
            watcher.signal(WatcherEventEnum.ON_FILE_MOVED, toPath, fromPath);
          }

          if (metadata.isDirectory) {
            watcher.signal(WatcherEventEnum.ON_DIR_MOVED, toPath, fromPath);
          }

          return;
        }

        const timeoutId = setTimeout(async () => {
          const fromPath = oldPath;

          this.moveSignals.delete(metadata.ino);

          await this.metadataService.delete(fromPath);

          if (!shouldEmitEvents) return;

          if (metadata.isFile) {
            watcher.signal(WatcherEventEnum.ON_FILE_REMOVED, fromPath);
          }

          if (metadata.isDirectory) {
            watcher.signal(WatcherEventEnum.ON_DIR_REMOVED, fromPath);
          }
        }, 150);

        this.moveSignals.set(metadata.ino, () => {
          const fromPath = oldPath;

          clearTimeout(timeoutId);

          this.moveSignals.delete(metadata.ino);

          return fromPath;
        });
      } else if (action.kind === "move" || action.kind === "rename") {
        const metadata = await this.metadataService.get(action.fromPath);

        if (!metadata)
          throw new Error(`The metadata was not found: ${action.fromPath}`);

        await this.metadataService.update(action.fromPath, action.toPath);

        if (!shouldEmitEvents) return;

        if (action.kind === "move") {
          if (metadata.isFile) {
            watcher.signal(
              WatcherEventEnum.ON_FILE_MOVED,
              action.toPath,
              action.fromPath
            );
          }

          if (metadata.isDirectory) {
            watcher.signal(
              WatcherEventEnum.ON_DIR_MOVED,
              action.toPath,
              action.fromPath
            );
          }
        } else {
          if (metadata.isFile) {
            watcher.signal(
              WatcherEventEnum.ON_FILE_RENAMED,
              action.toPath,
              action.fromPath
            );
          }

          if (metadata.isDirectory) {
            watcher.signal(
              WatcherEventEnum.ON_DIR_RENAMED,
              action.toPath,
              action.fromPath
            );
          }
        }
      }
    }
  }

  @OnJobFailed()
  onJobFailed(_job: Job<WatcherWorkerJobData>, error: Error) {
    this.logger.error(
      `The watcher has failed: ${toJSON({
        message: error.message,
        cause: error.cause,
        stack: error.stack,
        name: error.name,
      })}`,
      WatcherWorker.name
    );
  }
}
