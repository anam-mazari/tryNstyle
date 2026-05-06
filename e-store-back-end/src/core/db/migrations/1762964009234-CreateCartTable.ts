import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCartTable1762964009234 implements MigrationInterface {
  name = 'CreateCartTable1762964009234';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "cart-Item" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "userId" character varying NOT NULL, "price" character varying NOT NULL, "stockQuantity" integer NOT NULL DEFAULT '1', "frameStyle" character varying(255), "category" character varying, "brand" character varying(255), "imageUrl" character varying(255), CONSTRAINT "PK_230b1a219fb4f7f222170a45228" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "cart-Item"`);
  }
}
