import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  ValidationPipe,
  UsePipes,
  UseGuards,
  Req,
} from '@nestjs/common';
import { TodosService } from './todos.service';
import { CreateTodoDto } from './dto/todo.create.dto';
import { TodoDto } from './dto/todo.dto';
import { AuthGuard } from '@nestjs/passport';
import { UserDto } from 'src/users/dto/user.dto';
import { TodoListDto } from './dto/todoList.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('todos')
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

  @Get()
  async findAll(): Promise<TodoListDto> {
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
  async destroy(@Param('id') id: string) {
    return await this.todosService.destroyTodo(id);
  }
}
