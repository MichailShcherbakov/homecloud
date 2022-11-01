import { Injectable } from "@nestjs/common";
import chokidar from "chokidar";

@Injectable()
export class WatcherService {
  private readonly watchers: Map<string, chokidar.FSWatcher> = new Map<
    string,
    chokidar.FSWatcher
  >();

  public watch(path: string, options: { ignored?: RegExp } = {}): void {
    if (this.watchers.has(path)) return;

    this.watchers.set(path, chokidar.watch(path, options));
  }

  public unwatch(path: string): void {
    const watcher = this.getWatcher(path);

    if (!watcher) return;

    watcher.unwatch(path);

    this.watchers.delete(path);
  }

  public hasWatcher(path: string): boolean {
    return this.watchers.has(path);
  }

  public getWatcher(path: string): chokidar.FSWatcher | undefined {
    return this.watchers.get(path);
  }

  public on(path: string, event: string, cb: (path: string) => void): void {
    const watcher = this.getWatcher(path);

    if (!watcher) return;

    watcher.on(event, cb);
  }

  public off(path: string, event: string, cb: (path: string) => void): void {
    const watcher = this.getWatcher(path);

    if (!watcher) return;

    watcher.off(event, cb);
  }
}
