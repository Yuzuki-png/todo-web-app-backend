import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Patch,
  UseGuards,
  Request,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { Task } from './entity/task.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard) // すべてのエンドポイントに認証を要求
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  findAll(@Request() req): Promise<Task[]> {
    return this.tasksService.findAll(req.user.id);
  }

  @Post()
  createTask(
    @Body() createTaskDto: CreateTaskDto,
    @Request() req,
  ): Promise<Task> {
    return this.tasksService.createTask(createTaskDto.text, req.user.id);
  }

  @Delete(':id')
  deleteTask(@Param('id') id: string, @Request() req): Promise<void> {
    return this.tasksService.deleteTask(parseInt(id, 10), req.user.id);
  }

  @Patch(':id/toggle')
  toggleTask(@Param('id') id: string, @Request() req): Promise<Task> {
    return this.tasksService.toggleTask(parseInt(id, 10), req.user.id);
  }
}
