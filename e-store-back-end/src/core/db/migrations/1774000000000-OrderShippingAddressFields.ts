import { MigrationInterface, QueryRunner } from 'typeorm';

export class OrderShippingAddressFields1774000000000 implements MigrationInterface {
  name = 'OrderShippingAddressFields1774000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "orders" ADD COLUMN "shipping_address_line2" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ADD COLUMN "shipping_city" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ADD COLUMN "shipping_province" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ADD COLUMN "shipping_postal_code" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ADD COLUMN "shipping_country" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "orders" DROP COLUMN "shipping_country"`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" DROP COLUMN "shipping_postal_code"`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" DROP COLUMN "shipping_province"`,
    );
    await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "shipping_city"`);
    await queryRunner.query(
      `ALTER TABLE "orders" DROP COLUMN "shipping_address_line2"`,
    );
  }
}
