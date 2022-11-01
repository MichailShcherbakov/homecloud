import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("config")
export class ConfigEntity {
  @PrimaryGeneratedColumn("uuid")
  uuid: string;

  @Column()
  rootPath: string;
}
