import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CreateTaskDto } from '../dto/task.create.dto';
import { TaskDto } from '../dto/task.dto';
import { TaskListDto } from '../dto/taskList.dto';
import { TaskService } from './task.service';

@Controller('tasks')
export class TaskController {
  constructor(private taskService: TaskService) {}

  @Get(':id')
  async findOneTask(@Param('id') id: string): Promise<TaskDto> {
    return await this.taskService.getTask(id);
  }

  @Get('todo/:id')
  async findTasksByTodo(@Param('id') id: string): Promise<TaskListDto> {
    const tasks = await this.taskService.getTasksByTodo(id);
    return { tasks };
  }

  @Post('todo/:id')
  @UseGuards(AuthGuard())
  async create(
    @Param('id') todoId: string,
    @Body() createTaskDto: CreateTaskDto,
  ) {
    return await this.taskService.createTask(todoId, createTaskDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard())
  async destory(@Param('id') id: string): Promise<TaskDto> {
    return await this.taskService.destroyTask(id);
  }
}
