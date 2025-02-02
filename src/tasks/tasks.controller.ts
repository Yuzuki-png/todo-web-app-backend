import { Controller, Get, Post, Delete, Body, Param, Patch } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { Task } from './entity/task.entity';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  findAll(): Promise<Task[]> {
    return this.tasksService.findAll();
  }

  @Post()
  createTask(@Body() createTaskDto: CreateTaskDto): Promise<Task> {
    return this.tasksService.createTask(createTaskDto.text);
  }

  @Delete(':id')
  deleteTask(@Param('id') id: string): Promise<void> {
    return this.tasksService.deleteTask(parseInt(id, 10));
  }

  @Patch(':id/toggle')
  toggleTask(@Param('id') id: string): Promise<Task> {
    return this.tasksService.toggleTask(parseInt(id, 10));
  }
}
