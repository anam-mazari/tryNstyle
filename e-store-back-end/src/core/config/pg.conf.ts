import { TypeOrmModule } from '@nestjs/typeorm';
import { configService } from './env.conf';
import { entities } from '../db/entities/index';

export const ITypeOrmModule = TypeOrmModule.forRoot({
  ...configService.getTypeOrmConfig(),
  entities,
  logging: configService.isProduction() ? false : 'all',
});

export const ITypeOrmModuleFeatures = TypeOrmModule.forFeature(entities);

