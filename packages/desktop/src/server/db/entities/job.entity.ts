import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

export enum JobStatusEnum {
  PROCESSING = "PROCESSING",
  FINISHED = "FINISHED",
  STOPPED = "STOPPED",
  ERROR = "ERROR",
}

@Entity("jobs")
export class JobEntity {
  @PrimaryGeneratedColumn("uuid")
  uuid: string;

  @Column()
  ctx: string;

  @Column()
  type: string;

  @Column()
  status: JobStatusEnum;
}
