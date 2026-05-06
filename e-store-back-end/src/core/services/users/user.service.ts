import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../../db/entities/user.entity';
import type { RegisterCustomerDto } from '../../../feature/user/dto/register-customer.dto';
import type { LoginCustomerDto } from '../../../feature/user/dto/login-customer.dto';
import type {
  CustomerAuthUserDto,
  CustomerLoginResponseDto,
} from '../../../feature/user/dto/customer-auth-response.dto';

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

function toPublicUser(user: User): CustomerAuthUserDto {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    phone: user.phone ?? null,
    address: user.address ?? null,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
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

  private async findLatestByEmailWithPassword(
    email: string,
  ): Promise<User | null> {
    return this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('LOWER(user.email) = LOWER(:email)', { email: email.trim() })
      .orderBy('user.createdAt', 'DESC')
      .getOne();
  }

  async registerCustomer(
    dto: RegisterCustomerDto,
  ): Promise<CustomerLoginResponseDto> {
    const email = dto.email.trim();
    const existing = await this.findLatestByEmailWithPassword(email);

    const hash = await bcrypt.hash(dto.password, 10);

    if (existing) {
      if (existing.passwordHash) {
        throw new ConflictException('An account with this email already exists');
      }
      existing.passwordHash = hash;
      existing.username = dto.username.trim();
      if (dto.phone !== undefined) {
        existing.phone = dto.phone?.trim() || null;
      }
      if (dto.address !== undefined) {
        existing.address = dto.address?.trim() || null;
      }
      const saved = await this.userRepository.save(existing);
      return { user: toPublicUser(saved) };
    }

    const user = this.userRepository.create({
      username: dto.username.trim(),
      email,
      phone: dto.phone?.trim() || null,
      address: dto.address?.trim() || null,
      passwordHash: hash,
    });
    const saved = await this.userRepository.save(user);
    return { user: toPublicUser(saved) };
  }

  async loginCustomer(dto: LoginCustomerDto): Promise<CustomerLoginResponseDto> {
    const user = await this.findLatestByEmailWithPassword(dto.email.trim());
    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid email or password');
    }
    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid email or password');
    }
    return { user: toPublicUser(user) };
  }
}
