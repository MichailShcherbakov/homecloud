import { Injectable, Type } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import {
  QUEUE_MODULE_JOBS_STORAGE,
  QUEUE_MODULE_LISTENER,
  QUEUE_MODULE_PROCESS,
  QUEUE_MODULE_PROCESSOR,
} from "./queue.constants";
import {
  ListenerOptions,
  ProcessOptions,
  ProcessorOptions,
} from "./queue.decorators";

@Injectable()
export class QueueMetadataAccessor {
  constructor(private readonly reflector: Reflector) {}

  isStorage(target: Type<any> | Function): boolean {
    if (!target) {
      return false;
    }
    return !!this.reflector.get(QUEUE_MODULE_JOBS_STORAGE, target);
  }

  isProcessor(target: Type<any> | Function): boolean {
    if (!target) {
      return false;
    }
    return !!this.reflector.get(QUEUE_MODULE_PROCESSOR, target);
  }

  isProcess(target: Type<any> | Function): boolean {
    if (!target) {
      return false;
    }
    return !!this.reflector.get(QUEUE_MODULE_PROCESS, target);
  }

  isListener(target: Type<any> | Function): boolean {
    if (!target) {
      return false;
    }
    return !!this.reflector.get(QUEUE_MODULE_LISTENER, target);
  }

  getProcessorMetadata(target: Type<any> | Function): ProcessorOptions {
    return this.reflector.get(QUEUE_MODULE_PROCESSOR, target);
  }

  getProcessMetadata(target: Type<any> | Function): ProcessOptions {
    return this.reflector.get(QUEUE_MODULE_PROCESS, target);
  }

  getListenerMetadata(target: Type<any> | Function): ListenerOptions {
    return this.reflector.get(QUEUE_MODULE_LISTENER, target);
  }
}
