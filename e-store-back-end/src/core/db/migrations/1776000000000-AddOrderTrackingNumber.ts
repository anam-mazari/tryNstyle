import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Order entity requires tracking_number (unique); it was missing from early migrations.
 * Fixes Postgres 42703 (undefined_column) when loading orders (e.g. Stripe sync).
 */
export class AddOrderTrackingNumber1776000000000 implements MigrationInterface {
  name = 'AddOrderTrackingNumber1776000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_schema = 'public'
            AND table_name = 'orders'
            AND column_name = 'tracking_number'
        ) THEN
          ALTER TABLE "orders" ADD COLUMN "tracking_number" character varying;
          UPDATE "orders" SET "tracking_number" = 'TSY-LEGACY-' || REPLACE(SUBSTRING("order_id"::text, 1, 36), '-', '')
            WHERE "tracking_number" IS NULL OR TRIM("tracking_number") = '';
          ALTER TABLE "orders" ALTER COLUMN "tracking_number" SET NOT NULL;
          CREATE UNIQUE INDEX IF NOT EXISTS "UQ_orders_tracking_number" ON "orders" ("tracking_number");
        END IF;
      END $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "UQ_orders_tracking_number"`);
    await queryRunner.query(
      `ALTER TABLE "orders" DROP COLUMN IF EXISTS "tracking_number"`,
    );
  }
}
