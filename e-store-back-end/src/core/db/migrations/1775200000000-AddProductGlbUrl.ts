import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProductGlbUrl1775200000000 implements MigrationInterface {
  name = 'AddProductGlbUrl1775200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add glbUrl column — nullable text, stores path like "/models/glasses-aviator.glb"
    await queryRunner.query(`
      ALTER TABLE "product"
      ADD COLUMN IF NOT EXISTS "glbUrl" text NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "product"
      DROP COLUMN IF EXISTS "glbUrl"
    `);
  }
}
