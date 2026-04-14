import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProductFrameAndDetails1773000000000 implements MigrationInterface {
  name = 'AddProductFrameAndDetails1773000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product" ADD COLUMN "frameColor" character varying(255)`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" ADD COLUMN "description" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" ADD COLUMN "material" character varying(255)`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" ADD COLUMN "frameWidth" character varying(100)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "frameWidth"`);
    await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "material"`);
    await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "description"`);
    await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "frameColor"`);
  }
}
