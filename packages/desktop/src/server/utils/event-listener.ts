export type EventHandler<T = any> = (...args: T[]) => void;

export class EventListener<T = any> {
  private readonly events: Map<string, EventHandler<T>[]>;

  constructor() {
    this.events = new Map<string, EventHandler<T>[]>();
  }

  public on(type: string, cb: EventHandler<T>) {
    const handlers = this.events.get(type);

    if (handlers) {
      handlers.push(cb);
    } else {
      this.events.set(type, [cb]);
    }
  }

  public off(type: string, cb: EventHandler<T>) {
    const handlers = this.events.get(type);

    if (!handlers) return;

    const idx = handlers.indexOf(cb);

    if (idx === -1) return;

    handlers.splice(idx, 1);

    if (!handlers.length) this.events.delete(type);
  }

  protected emit(type: string, ...args: T[]) {
    const handlers = this.events.get(type);

    if (!handlers) return;

    handlers.forEach(h => h(...args));
  }
}
