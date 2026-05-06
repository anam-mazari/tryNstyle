import { DataSource } from 'typeorm';
import { configService } from './env.conf';
import { entities } from '../db/entities/index';

const isLocal = configService.isLocal();
export default new DataSource({
  ...configService.getDataSourceOptionsConfig(),
  entities: entities,
  migrations: [
    isLocal ? 'src/core/db/migrations/*.ts' : 'dist/core/db/migrations/*.js',
  ],
});
