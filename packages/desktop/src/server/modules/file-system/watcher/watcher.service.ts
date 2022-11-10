import { Injectable, OnModuleDestroy } from "@nestjs/common";
import watcher from "@parcel/watcher";
import { statSync } from "fs";
import { join } from "path";
import { SNAPSHOT_FILE_NAME, WATCHER_QUEUE_NAME } from ".";
import { InjectQueue, Queue } from "../../queue";
import { WatcherEventEnum } from "./watcher.events";
import { WatcherInstance, WatcherOptions } from "./watcher.instance";
import { WatcherWorkerJobData } from "./watcher.worker";

@Injectable()
export class WatcherService implements OnModuleDestroy {
  private readonly instances: Map<string, WatcherInstance> = new Map<
    string,
    WatcherInstance
  >();

  private readonly ignored: Set<string> = new Set<string>();

  constructor(@InjectQueue(WATCHER_QUEUE_NAME) private readonly queue: Queue) {}

  async onModuleDestroy() {
    await Promise.all(
      Array.from(this.instances).map(async ([path]) => {
        const snapshotPath = join(path, SNAPSHOT_FILE_NAME);

        await watcher.writeSnapshot(path, snapshotPath);
      })
    );
  }

  public async watch(
    path: string,
    options: WatcherOptions = {}
  ): Promise<WatcherInstance> {
    const subscription = await watcher.subscribe(path, (error, events) =>
      this.onEvent(path, events, error)
    );

    const existsWatcherInstance = this.getWatcher(path);

    if (existsWatcherInstance) return existsWatcherInstance;

    const instance = new WatcherInstance();
    instance.options = options;
    instance.sub = subscription;

    this.instances.set(path, instance);

    const stat = statSync(path);

    if (stat.isFile()) return instance;

    const snapshotPath = join(path, SNAPSHOT_FILE_NAME);

    const events = await watcher.getEventsSince(path, snapshotPath);

    events.forEach(event => {
      this.onEvent(path, [event], null);
    });

    return instance;
  }

  public async unwatch(path: string): Promise<void> {
    const watcher = this.instances.get(path);

    if (!watcher) return;

    await watcher.sub.unsubscribe();
  }

  public pauseWatch(path: string): void {
    if (this.ignored.has(path)) return;

    this.ignored.add(path);
  }

  public resumeWatch(path: string): void {
    this.ignored.delete(path);
  }

  public hasWatcher(path: string): boolean {
    return this.instances.has(path);
  }

  private getWatcher(path: string): WatcherInstance | undefined {
    return this.instances.get(path);
  }

  private onEvent = (
    path: string,
    events: watcher.Event[],
    error: Error | null
  ) => {
    const shouldEmitEvents = !this.ignored.has(path);
    const watcher = this.getWatcher(path);

    if (!watcher) return;

    events = events.filter(e => !watcher.options.ignored?.test(e.path));

    if (!events.length) return;

    if (error && shouldEmitEvents) {
      watcher.signal(WatcherEventEnum.ON_ERROR, error);
      return;
    }

    this.queue.addJob<WatcherWorkerJobData>({
      watcher,
      events,
      shouldEmitEvents,
    });
  };

  public on(
    path: string,
    event: WatcherEventEnum,
    cb: (...args: any[]) => void
  ): void {
    const watcher = this.getWatcher(path);

    if (!watcher) return;

    watcher.on(event, cb);
  }

  public off(
    path: string,
    event: WatcherEventEnum,
    cb: (...args: any[]) => void
  ): void {
    const watcher = this.getWatcher(path);

    if (!watcher) return;

    watcher.off(event, cb);
  }
}
