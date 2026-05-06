import { Controller, Post, Body } from '@nestjs/common';
import { AdminService } from 'src/core/services/admin/admin.service';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post()
  create(@Body() body: any) {
    return this.adminService.createAdmin(body.name, body.email, body.password);
  }

  @Post('login')
  login(@Body() body: { email: string; password: string }) {
    return this.adminService.login(body.email, body.password);
  }
}
