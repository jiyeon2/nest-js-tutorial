import { Module } from '@nestjs/common';
import { TodosService } from './todos.service';
import { TaskService } from './task/task.service';
import { TodosController } from './todos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TodoEntity } from './entities/todo.entity';
import { TaskEntity } from './entities/task.entity';
import { UserEntity } from '../users/entities/user.entity';
import { UsersModule } from '../users/users.module';
import { AuthModule } from '../auth/auth.module';
import { TaskController } from './task/task.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([TodoEntity, TaskEntity, UserEntity]),
    UsersModule,
    AuthModule,
  ],
  controllers: [TodosController, TaskController],
  providers: [TodosService, TaskService],
})
export class TodosModule {}
