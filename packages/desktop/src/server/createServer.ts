import { AppModule } from "./modules/app.module";
import { createApp, IApplication } from "./utils/createApp";

export interface IServer extends IApplication {}

export function createServer(): Promise<IServer> {
  return createApp(AppModule);
}
