import { IsNotEmpty, IsString } from 'class-validator';

export class RegisterDeviceDto {
  @IsNotEmpty()
  @IsString()
  name!: string;
}
