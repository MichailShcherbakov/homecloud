import { Type } from "class-transformer";
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from "class-validator";

export class DestinationUpload {
  @IsUUID()
  uuid: string;
}

export class TargetUpload {
  @IsUUID()
  uuid: string;
}

export class UploadDto {
  @ValidateNested()
  @Type(() => DestinationUpload)
  @IsOptional()
  destination?: DestinationUpload;

  @ValidateNested()
  @Type(() => TargetUpload)
  target: TargetUpload;
}
