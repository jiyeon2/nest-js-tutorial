import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { toTaskDto } from 'src/shared/mapper';
import { Repository } from 'typeorm';
import { CreateTaskDto } from '../dto/task.create.dto';
import { TaskDto } from '../dto/task.dto';
import { TaskEntity } from '../entities/task.entity';
import { TodoEntity } from '../entities/todo.entity';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(TaskEntity)
    private readonly tasksRepository: Repository<TaskEntity>,
    @InjectRepository(TodoEntity)
    private readonly todosRepository: Repository<TodoEntity>,
  ) {}

  async getTask(id: string): Promise<TaskDto> {
    const task = await this.tasksRepository.findOne({ where: { id } });
    if (!task) {
      throw new HttpException('task not exist', HttpStatus.BAD_REQUEST);
    }
    return toTaskDto(task);
  }

  async getTasksByTodo(id: string): Promise<TaskDto[]> {
    const tasks = await this.tasksRepository.find({
      where: { todo: { id } },
      relations: ['todo'],
    });

    return tasks.map((task) => toTaskDto(task));
  }

  async createTask(todoId: string, taskDto: CreateTaskDto) {
    const { name } = taskDto;
    const todo = await this.todosRepository.findOne({
      where: { id: todoId },
      relations: ['tasks', 'owner'],
    });

    const task = await this.tasksRepository.create({
      name,
      todo,
    });

    await this.tasksRepository.save(task);
    return toTaskDto(task);
  }

  async destroyTask(id: string): Promise<TaskDto> {
    const task = await this.tasksRepository.findOne({ where: { id } });
    if (!task) {
      throw new HttpException('task doesnt exist', HttpStatus.BAD_REQUEST);
    }
    await this.tasksRepository.delete({ id });
    return toTaskDto(task);
  }
}
