import { MigrationInterface, QueryRunner } from 'typeorm';

export class IncreaseImageUrlLength1772006886394 implements MigrationInterface {
  name = 'IncreaseImageUrlLength1772006886394';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Change imageUrl from varchar(255) to text for product table
    await queryRunner.query(
      `ALTER TABLE "product" ALTER COLUMN "imageUrl" TYPE text`,
    );

    // Also update cart-Item table if it exists
    await queryRunner.query(
      `ALTER TABLE "cart-Item" ALTER COLUMN "imageUrl" TYPE text`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert back to varchar(255)
    await queryRunner.query(
      `ALTER TABLE "product" ALTER COLUMN "imageUrl" TYPE character varying(255)`,
    );
    await queryRunner.query(
      `ALTER TABLE "cart-Item" ALTER COLUMN "imageUrl" TYPE character varying(255)`,
    );
  }
}
