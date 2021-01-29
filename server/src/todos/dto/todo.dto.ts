import { IsNotEmpty } from 'class-validator';
import { UserDto } from 'src/users/dto/user.dto';
import { TaskDto } from './task.dto';

export class TodoDto {
  @IsNotEmpty()
  id: string;

  @IsNotEmpty()
  name: string;

  createdOn?: Date;
  description?: string;
  tasks?: TaskDto[];
  user?: UserDto;
}
