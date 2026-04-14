import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Admin } from 'src/core/db/entities/admin';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Admin)
    private readonly adminRepo: Repository<Admin>,
  ) {}

  async findAll(): Promise<Admin[]> {
    return this.adminRepo.find();
  }

  async createAdmin(name: string, email: string, password: string): Promise<Admin> {
    const hashed = await bcrypt.hash(password, 10);

    const admin = this.adminRepo.create({
      name,
      email,
      password: hashed,
    });

    return this.adminRepo.save(admin);
  }

  async login(email: string, password: string): Promise<{ admin: Omit<Admin, 'password'>; token?: string }> {
    const admin = await this.adminRepo.findOne({ where: { email } });
    
    if (!admin) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!admin.isActive) {
      throw new UnauthorizedException('Admin account is inactive');
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);
    
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Return admin without password
    const { password: _, ...adminWithoutPassword } = admin;
    
    return {
      admin: adminWithoutPassword,
      // Note: In a real app, you'd generate a JWT token here
      // token: this.jwtService.sign({ id: admin.id, email: admin.email })
    };
  }
}
