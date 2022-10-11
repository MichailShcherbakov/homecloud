import { Injectable } from "@nestjs/common";
import * as fs from "fs";
import * as util from "util";

const TEMP_DIR_LOCATION = "C:/Users/Michail/Downloads/homecloud";

interface Statistics {
  total_file_count: number;
  total_dirs_count: number;
  total_space_size: number;
}

@Injectable()
export class StorageService {
  async getStatistics(): Promise<Statistics> {
    const readdir = util.promisify(fs.readdir);

    const dir = await readdir(TEMP_DIR_LOCATION);
    console.log(dir);

    return {
      total_file_count: 0,
      total_dirs_count: 0,
      total_space_size: 0,
    };
  }
}
