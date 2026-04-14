import { Module } from '@nestjs/common';
import { ITypeOrmModuleFeatures } from '../../core/config/pg.conf';
import { UserController } from './user.controller';
import { UserService } from '../../core/services/users/user.service';

@Module({
  imports: [ITypeOrmModuleFeatures],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}


