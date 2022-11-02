import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

export enum JobStatusEnum {
  PROCESSING = "PROCESSING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  STOPPED = "STOPPED",
}

@Entity("jobs", {})
export class JobEntity {
  @PrimaryGeneratedColumn("uuid")
  uuid: string;

  @Column()
  data: string;

  @Column()
  processorName: string;

  @Column()
  processName: string;

  @Column()
  status: JobStatusEnum;

  @UpdateDateColumn()
  updatedAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
