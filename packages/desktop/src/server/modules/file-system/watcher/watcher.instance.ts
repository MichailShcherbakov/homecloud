import watcher from "@parcel/watcher";
import { EventListener } from "@/server/utils/event-listener";

export interface WatcherOptions {
  ignored?: RegExp;
}

export class WatcherInstance extends EventListener {
  public options: WatcherOptions;
  public sub: watcher.AsyncSubscription;

  public signal(type: string, ...args: any[]) {
    this.emit(type, ...args);
  }
}
