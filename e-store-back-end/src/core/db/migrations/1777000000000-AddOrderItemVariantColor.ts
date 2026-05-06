import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOrderItemVariantColor1777000000000
  implements MigrationInterface
{
  name = 'AddOrderItemVariantColor1777000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "order_items" ADD COLUMN "variant_color" character varying(255)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "order_items" DROP COLUMN "variant_color"`,
    );
  }
}

