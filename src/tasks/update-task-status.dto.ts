import { IsEnum, IsNotEmpty } from 'class-validator';
import { TaskStatus } from './task.model';

export class UpdateTaskStatusDto {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  @IsNotEmpty()
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  @IsEnum(TaskStatus)
  status: TaskStatus;
}
