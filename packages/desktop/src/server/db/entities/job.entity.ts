import { Column, Entity } from "typeorm";
import { IEntity } from "./entity.interface";

export enum JobStatusEnum {
  PROCESSING = "PROCESSING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  STOPPED = "STOPPED",
}

@Entity("jobs")
export class JobEntity extends IEntity {
  @Column()
  data: string;

  @Column()
  processorName: string;

  @Column()
  processName: string;

  @Column()
  status: JobStatusEnum;
}
