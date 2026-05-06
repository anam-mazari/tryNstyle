import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCategoryAndBrandTables1772009814059 implements MigrationInterface {
  name = 'CreateCategoryAndBrandTables1772009814059';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create categories table
    await queryRunner.query(`
            CREATE TABLE "categories" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying(255) NOT NULL,
                "description" text,
                "parentCategoryId" character varying(255),
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_categories_name" UNIQUE ("name"),
                CONSTRAINT "PK_categories" PRIMARY KEY ("id")
            )
        `);

    // Create brands table
    await queryRunner.query(`
            CREATE TABLE "brands" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying(255) NOT NULL,
                "description" text,
                "logoUrl" character varying(255),
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_brands_name" UNIQUE ("name"),
                CONSTRAINT "PK_brands" PRIMARY KEY ("id")
            )
        `);

    // Add foreign key columns to product table
    await queryRunner.query(
      `ALTER TABLE "product" ADD COLUMN "categoryId" uuid`,
    );
    await queryRunner.query(`ALTER TABLE "product" ADD COLUMN "brandId" uuid`);

    // Add foreign key constraints
    await queryRunner.query(`
            ALTER TABLE "product" 
            ADD CONSTRAINT "FK_product_category" 
            FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE SET NULL
        `);

    await queryRunner.query(`
            ALTER TABLE "product" 
            ADD CONSTRAINT "FK_product_brand" 
            FOREIGN KEY ("brandId") REFERENCES "brands"("id") ON DELETE SET NULL
        `);

    // Create indexes for better performance
    await queryRunner.query(
      `CREATE INDEX "IDX_product_categoryId" ON "product" ("categoryId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_product_brandId" ON "product" ("brandId")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign key constraints
    await queryRunner.query(
      `ALTER TABLE "product" DROP CONSTRAINT "FK_product_brand"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" DROP CONSTRAINT "FK_product_category"`,
    );

    // Drop columns from product table
    await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "brandId"`);
    await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "categoryId"`);

    // Drop tables
    await queryRunner.query(`DROP TABLE "brands"`);
    await queryRunner.query(`DROP TABLE "categories"`);
  }
}
