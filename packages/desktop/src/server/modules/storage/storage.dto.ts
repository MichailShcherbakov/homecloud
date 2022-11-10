import { Type } from "class-transformer";
import { IsOptional, IsUUID, ValidateNested } from "class-validator";

export class DestinationUpload {
  @IsUUID()
  uuid: string;
}

export class UploadDto {
  @ValidateNested()
  @Type(() => DestinationUpload)
  @IsOptional()
  destination?: DestinationUpload;
}
