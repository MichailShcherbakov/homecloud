import { ConfigEntity } from "@server/db/entities/config.entity";
import { Global, Logger, Module } from "@nestjs/common";
import { ConfigService } from "./config.service";
import { TypeOrmModule } from "@nestjs/typeorm";

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([ConfigEntity])],
  providers: [ConfigService, Logger],
  exports: [ConfigService],
})
export class ConfigModule {}
