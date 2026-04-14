import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProductColorVariantImages1775000000000 implements MigrationInterface {
  name = 'AddProductColorVariantImages1775000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product" ADD COLUMN "colorVariantImages" jsonb`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "colorVariantImages"`);
  }
}
