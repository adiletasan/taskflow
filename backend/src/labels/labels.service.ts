import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Label } from './entities/label.entity';
import { CreateLabelDto } from './dto/create-label.dto';
import { UpdateLabelDto } from './dto/update-label.dto';

@Injectable()
export class LabelsService {
  constructor(
    @InjectRepository(Label)
    private readonly labelsRepo: Repository<Label>,
  ) {}

  async create(userId: string, dto: CreateLabelDto): Promise<Label> {
    const label = this.labelsRepo.create({ ...dto, userId });
    return this.labelsRepo.save(label);
  }

  async findAll(userId: string): Promise<Label[]> {
    return this.labelsRepo.find({
      where: { userId },
      order: { createdAt: 'ASC' },
    });
  }

  async findOne(userId: string, id: string): Promise<Label> {
    const label = await this.labelsRepo.findOne({ where: { id, userId } });
    if (!label) throw new NotFoundException('Метка не найдена');
    return label;
  }

  async update(userId: string, id: string, dto: UpdateLabelDto): Promise<Label> {
    const label = await this.findOne(userId, id);
    Object.assign(label, dto);
    return this.labelsRepo.save(label);
  }

  async remove(userId: string, id: string): Promise<{ message: string }> {
    const label = await this.findOne(userId, id);
    await this.labelsRepo.remove(label);
    return { message: 'Метка удалена' };
  }
}