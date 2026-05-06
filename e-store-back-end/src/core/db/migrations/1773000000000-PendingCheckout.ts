import { MigrationInterface, QueryRunner } from 'typeorm';

export class PendingCheckout1773000000000 implements MigrationInterface {
  name = 'PendingCheckout1773000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "pending_checkouts" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "checkout_payload" jsonb NOT NULL,
        "total_amount" numeric(10,2) NOT NULL,
        "stripe_session_id" character varying,
        "status" character varying NOT NULL DEFAULT 'pending',
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_pending_checkouts" PRIMARY KEY ("id")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "pending_checkouts"`);
  }
}
