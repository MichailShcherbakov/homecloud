export interface Statistics {
  directories: {
    count: number;
    size: number;
  };
  files: {
    count: number;
    size: number;
  };
  storage: {
    size: number;
  };
}
