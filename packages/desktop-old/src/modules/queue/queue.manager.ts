import Queue from "queue";
import { Injectable } from "@nestjs/common";
import { EventListener } from "@/utils/event-listener";

export type Worker<R = any> = () => Promise<R>;

@Injectable()
export class QueueManager extends EventListener {
  private readonly queue: Queue;

  constructor() {
    super();

    this.queue = Queue({ results: [], autostart: true, concurrency: 5 });

    this.queue.on("start", job => {
      this.emit("start", job);
    });
    this.queue.on("success", (result, job) => {
      this.emit("done", result, job);
    });
    this.queue.on("error", (err, job) => {
      this.emit("failed", err, job);
    });
    this.queue.on("end", (_, err) => {
      this.emit("end", err);
    });
  }

  public add(worker: Worker) {
    this.queue.push(worker);
  }

  public getCount() {
    return this.queue.length;
  }

  public setAutostart(flag: boolean) {
    this.queue.autostart = flag;
  }

  public run(cb: () => void) {
    this.queue.start(cb);
  }
}
