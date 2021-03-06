import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { TodosService } from './todos.service';
import { CreateTodoDto } from './dto/todo.create.dto';
import { TodoDto } from './dto/todo.dto';
import { UserDto } from 'src/users/dto/user.dto';
import { TodoListDto } from './dto/todoList.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import express from 'express';

@Controller('todos')
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

  @Get()
  async findAll(@Req() req: express.Request): Promise<TodoListDto> {
    const todos = await this.todosService.getAllTodo();
    return { todos };
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<TodoDto> {
    return await this.todosService.getOneTodo(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Body() createTodoDto: CreateTodoDto,
    @Req() req: any,
  ): Promise<TodoDto> {
    const user = req.user as UserDto; // 로그인한 유저 - passport에 의해 생성됨
    return await this.todosService.createTodo(user, createTodoDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() updateTodoDto: TodoDto,
  ): Promise<TodoDto> {
    return await this.todosService.updateTodo(id, updateTodoDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async destroy(
    @Param('id') todoId: string,
    @Body('username') username: string,
  ) {
    return await this.todosService.destroyTodo(todoId, username);
  }
}
