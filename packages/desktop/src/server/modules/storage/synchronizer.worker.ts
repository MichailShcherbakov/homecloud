import { IWorkerContext, IWorkerResult } from "../queue/queue.manager";

export const SYNCHRONIZER_CREATE_WORKER_TYPE =
  "SYNCHRONIZER_CREATE_WORKER_TYPE";
export const SYNCHRONIZER_REMOVE_WORKER_TYPE =
  "SYNCHRONIZER_REMOVE_WORKER_TYPE";

export interface SynchronizerWorkerContext extends IWorkerContext {
  absolutePath: string;
}

export interface SynchronizerWorkerResult extends IWorkerResult {}
