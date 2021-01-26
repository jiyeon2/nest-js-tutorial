import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { TodoEntity } from './entities/todo.entity';
import { TodoDto } from './dto/todo.dto';
import { toTodoDto } from 'src/shared/mapper';
import { CreateTodoDto } from './dto/todo.create.dto';

import { UserDto } from '../users/dto/user.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class TodosService {
  constructor(
    @InjectRepository(TodoEntity)
    private readonly todosRepository: Repository<TodoEntity>,
    private readonly usersService: UsersService,
  ) {}

  async createTodo({ username }: UserDto, createTodoDto: CreateTodoDto) {
    const { name, description } = createTodoDto;

    const owner = await this.usersService.findOne({ where: { username } });
    const todo = await this.todosRepository.create({
      name,
      description,
      owner,
    });

    await this.todosRepository.save(todo);
    return toTodoDto(todo);
  }

  async getOneTodo(id: string): Promise<TodoDto> {
    const todo = await this.todosRepository.findOne({
      where: { id },
      relations: ['tasks', 'owner'],
    });

    if (!todo) {
      throw new HttpException('todo not exist', HttpStatus.BAD_REQUEST);
    }
    return toTodoDto(todo);
  }

  async getAllTodo(): Promise<TodoDto[]> {
    const todos = await this.todosRepository.find({
      relations: ['tasks', 'owner'],
    });
    return todos.map((todo) => toTodoDto(todo));
  }

  async updateTodo(id: string, updateTodoDto: TodoDto) {
    const { name, description } = updateTodoDto;
    let todo = await this.todosRepository.findOne({ where: { id } });
    if (!todo) {
      throw new HttpException('todo not exist', HttpStatus.BAD_REQUEST);
    }

    todo = { id, name, description };

    await this.todosRepository.update({ id }, todo);
    todo = await this.todosRepository.findOne({
      where: { id },
      relations: ['tasks', 'owner'],
    });

    return toTodoDto(todo);
  }

  async destroyTodo(id: string) {
    const todo = await this.getOneTodo(id);

    if (todo.tasks && todo.tasks.length > 0) {
      throw new HttpException(
        'cannot delete this todo list, it has existing tasks',
        HttpStatus.FORBIDDEN,
      );
    }

    await this.todosRepository.delete({ id });
    return toTodoDto(todo);
  }
}
