import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateOrderTable1766327857876 implements MigrationInterface {
  name = 'UpdateOrderTable1766327857876';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "price"`);
    await queryRunner.query(
      `ALTER TABLE "product" ADD "price" numeric(10,2) NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "price"`);
    await queryRunner.query(
      `ALTER TABLE "product" ADD "price" character varying NOT NULL`,
    );
  }
}
