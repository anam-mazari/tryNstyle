import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSourceOptions } from 'typeorm';

// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();

export enum AppMode {
  PRODUCTION = 'production',
  NON_PRODUCTION = 'non-production',
  LOCAL = 'local',
}

class ConfigService {
  constructor(private env: { [k: string]: string | undefined }) {}

  private getValue(key: string, throwOnMissing = true): string {
    const value = this.env[key];
    if (!value && throwOnMissing) {
      throw new Error(`config error - missing env.${key}`);
    }

    return value!;
  }

  public ensureValues(keys: string[]) {
    keys.forEach((k) => this.getValue(k, true));
    return this;
  }

  public getMode(): AppMode {
    const mode = this.getValue('MODE');
    if (!Object.values(AppMode).includes(mode as AppMode)) {
      throw new Error(
        `Invalid MODE: ${mode}. Must be one of ${Object.values(AppMode).join(', ')}`,
      );
    }
    return mode as AppMode;
  }

  public isProduction() {
    return this.getMode() === AppMode.PRODUCTION;
  }

  public isLocal() {
    return this.getMode() === AppMode.LOCAL;
  }

  public getTypeOrmConfig(): TypeOrmModuleOptions {
    const mode = this.getMode();
    return {
      type: 'postgres',
      host: this.getValue('POSTGRES_HOST'),
      port: parseInt(this.getValue('POSTGRES_PORT')),
      username: this.getValue('POSTGRES_USER'),
      password: this.getValue('POSTGRES_PASSWORD'),
      database: this.getValue('POSTGRES_DATABASE'),
      synchronize: false,
      ...(mode !== AppMode.LOCAL && {
        ssl: { rejectUnauthorized: false },
      }),
    };
  }

  public getDataSourceOptionsConfig(): DataSourceOptions {
    const mode = this.getMode();
    return {
      type: 'postgres',
      host: this.getValue('POSTGRES_HOST'),
      port: parseInt(this.getValue('POSTGRES_PORT')),
      username: this.getValue('POSTGRES_USER'),
      password: this.getValue('POSTGRES_PASSWORD'),
      database: this.getValue('POSTGRES_DATABASE'),
      ...(mode !== AppMode.LOCAL && {
        ssl: { rejectUnauthorized: false },
      }),
    };
  }
}

const configService = new ConfigService(process.env).ensureValues([
  'POSTGRES_HOST',
  'POSTGRES_PORT',
  'POSTGRES_USER',
  'POSTGRES_PASSWORD',
  'POSTGRES_DATABASE',
  'MODE',
]);

export { configService };
