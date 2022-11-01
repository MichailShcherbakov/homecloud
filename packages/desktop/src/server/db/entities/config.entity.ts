import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class ConfigEntity {
  @PrimaryGeneratedColumn("uuid")
  uuid: string;

  @Column()
  rootPath: string;
}
