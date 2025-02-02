import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './entity/task.entity';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
  ) {}

  async findAll(): Promise<Task[]> {
    return this.taskRepository.find();
  }

  async createTask(text: string): Promise<Task> {
    const task = this.taskRepository.create({ text, completed: false });
    return this.taskRepository.save(task);
  }

  async deleteTask(id: number): Promise<void> {
    await this.taskRepository.delete(id);
  }

  async toggleTask(id: number): Promise<Task> {
    const task = await this.taskRepository.findOne({ where: { id } });
    if (!task) {
      throw new Error('Task not found');
    }
    task.completed = !task.completed;
    return this.taskRepository.save(task);
  }
}
