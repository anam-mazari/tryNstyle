import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProductShape1773100000000 implements MigrationInterface {
  name = 'AddProductShape1773100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product" ADD COLUMN "shape" character varying(255)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "shape"`);
  }
}
