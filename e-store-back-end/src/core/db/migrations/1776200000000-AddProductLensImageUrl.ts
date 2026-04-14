import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProductLensImageUrl1776200000000 implements MigrationInterface {
  name = 'AddProductLensImageUrl1776200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "product"
      ADD COLUMN IF NOT EXISTS "lensImageUrl" text NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "product"
      DROP COLUMN IF EXISTS "lensImageUrl"
    `);
  }
}
