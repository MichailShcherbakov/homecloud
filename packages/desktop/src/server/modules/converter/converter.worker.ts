import { toHLS } from "@server/utils/to-hls";
import { IWorker, IWorkerContext, IWorkerResult } from "../queue/queue.manager";

export interface ConverterWorkerContext extends IWorkerContext {
  inputFilePath: string;
  outputFilePath: string;
}

export interface ConverterWorkerResult extends IWorkerResult {}

export class ConverterWorker
  implements IWorker<ConverterWorkerContext, ConverterWorkerResult>
{
  async run(ctx: ConverterWorkerContext) {
    const { inputFilePath, outputFilePath } = ctx;

    await toHLS(inputFilePath, outputFilePath);
  }
}
