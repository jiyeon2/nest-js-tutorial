import { TodoDto } from '../todos/dto/todo.dto';
import { TaskDto } from '../todos/dto/task.dto';
import { UserDto } from '../users/dto/user.dto';
import { TodoEntity } from '../todos/entities/todo.entity';
import { TaskEntity } from 'src/todos/entities/task.entity';
import { UserEntity } from '../users/entities/user.entity';

// todoEntity를 todoDto에 매핑시키기위한 유틸리티 함수
export const toTodoDto = (data: TodoEntity): TodoDto => {
  const { id, name, description, tasks, user } = data;

  let todoDto: TodoDto = { id, name, description, user };

  if (tasks) {
    todoDto = {
      ...todoDto,
      tasks: tasks.map((task: TaskEntity) => toTaskDto(task)),
    };
  }
  return todoDto;
};

export const toTaskDto = (data: TaskEntity): TaskDto => {
  const { id, name } = data;

  const taskDto: TaskDto = { id, name };
  return taskDto;
};

export const toUserDto = (data: UserEntity): UserDto => {
  const { id, username, email } = data;
  const userDto: UserDto = { id, username, email };
  return userDto;
};
