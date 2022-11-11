import { MetadataEntity } from "@/server/db/entities/metadata.entity";

export const mockedMetadataService = {
  set: vi.fn<[string], Partial<MetadataEntity>>(),
  get: vi.fn(),
  delete: vi.fn(),
};
