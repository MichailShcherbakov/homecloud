export interface Statistics {
  directories: {
    count: number;
    size: BigInt;
  };
  files: {
    count: number;
    size: BigInt;
  };
  storage: {
    size: BigInt;
  };
}
