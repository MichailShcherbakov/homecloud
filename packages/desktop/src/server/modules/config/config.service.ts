import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { resolve } from "path";
import { InjectRepository } from "@nestjs/typeorm";
import { ConfigEntity } from "@/server/db/entities/config.entity";
import { IsNull, Not, Repository } from "typeorm";

const DEFAULT_CONFIG_DIR_NAME = "storage";

@Injectable()
export class ConfigService implements OnModuleInit {
  private config: ConfigEntity;

  constructor(
    @InjectRepository(ConfigEntity)
    private readonly configRepository: Repository<ConfigEntity>,
    private readonly logger: Logger
  ) {}

  async onModuleInit() {
    /*  return first config */
    let config = await this.configRepository.findOne({
      where: {
        uuid: Not(IsNull()),
      },
    });

    if (!config) {
      this.logger.log(`Creating initial configuration...`, ConfigService.name);

      const initialConfig = new ConfigEntity();
      // initialConfig.rootPath = resolve(process.cwd(), DEFAULT_CONFIG_DIR_NAME);
      initialConfig.rootPath = "C:\\Users\\Michail\\Downloads\\homecloud";

      config = await this.configRepository.save(initialConfig);

      this.logger.log(
        `The initial configuration was created.`,
        ConfigService.name
      );
    }

    this.config = config;

    this.logger.log(
      `Loaded the configuration:\n${JSON.stringify(this.config, null, 4)}`,
      ConfigService.name
    );
  }

  async getRootPath(): Promise<string> {
    return this.config.rootPath;
  }

  async setRootPath(path: string): Promise<void> {
    this.config.rootPath = path;

    await this.sync();
  }

  private async sync(): Promise<void> {
    await this.configRepository.save(this.config);

    this.logger.log(
      `Sync configuration:/n${JSON.stringify(this.config, null, 4)}`,
      ConfigService.name
    );
  }
}
