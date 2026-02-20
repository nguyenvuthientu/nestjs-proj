import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class FindOneParams {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  @IsNotEmpty()
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  @IsString()
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  @IsUUID()
  id: string;
}
