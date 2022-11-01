import { IWorker, IWorkerContext, IWorkerResult } from "../queue/queue.manager";

export interface SynchronizerWorkerContext extends IWorkerContext {
  absolutePath: string;
}

export interface SynchronizerWorkerResult extends IWorkerResult {}

export class SynchronizerWorker
  implements IWorker<SynchronizerWorkerContext, SynchronizerWorkerResult>
{
  async run(ctx: SynchronizerWorkerContext) {
    const {} = ctx;
  }
}
