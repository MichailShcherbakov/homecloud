import { Global, Logger, Module } from "@nestjs/common";
import { ConfigService } from "./config.service";
import { TypeOrmModule } from "@nestjs/typeorm";

@Global()
@Module({
  providers: [ConfigService, Logger],
  exports: [ConfigService],
})
export class ConfigModule {}
