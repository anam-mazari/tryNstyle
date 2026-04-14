import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../db/entities/user.entity';

export interface CreateUserDto {
  username: string;
  email: string;
  phone?: string | null;
  address?: string | null;
}

export interface UpdateUserDto {
  username: string;
  email: string;
  phone?: string | null;
  address?: string | null;
}

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findOne(id: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  async create(payload: CreateUserDto): Promise<User> {
    const user = this.userRepository.create({
      username: payload.username,
      email: payload.email,
      phone: payload.phone ?? null,
      address: payload.address ?? null,
    });
    return this.userRepository.save(user);
  }

  async update(id: string, payload: UpdateUserDto): Promise<User | null> {
    const user = await this.findOne(id);
    if (!user) return null;
    if (payload.username !== undefined) user.username = payload.username;
    if (payload.email !== undefined) user.email = payload.email;
    if (payload.phone !== undefined) user.phone = payload.phone;
    if (payload.address !== undefined) user.address = payload.address;
    return this.userRepository.save(user);
  }

  async remove(id: string): Promise<boolean> {
    const res = await this.userRepository.delete({ id });
    return (res.affected ?? 0) > 0;
  }
}


