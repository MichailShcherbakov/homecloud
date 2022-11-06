import { IsOptional, IsUUID } from "class-validator";

export class UploadEntitiesDto {
  @IsUUID()
  targetUUID: string;

  @IsUUID()
  @IsOptional()
  destinationUUID?: string;
}
