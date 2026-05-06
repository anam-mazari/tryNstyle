import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateProductTable1763048452863 implements MigrationInterface {
  name = 'CreateProductTable1763048452863';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "product" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "price" character varying NOT NULL, "stockQuantity" integer NOT NULL DEFAULT '1', "frameStyle" character varying(255), "category" character varying, "brand" character varying(255), "imageUrl" character varying(255), CONSTRAINT "PK_bebc9158e480b949565b4dc7a82" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "product"`);
  }
}
