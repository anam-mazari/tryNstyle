import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateOrderTables1766328247998 implements MigrationInterface {
    name = 'CreateOrderTables1766328247998'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create orders table
        await queryRunner.query(`
            CREATE TABLE "orders" (
                "order_id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "total_amount" numeric(10,2) NOT NULL,
                "payment_method" character varying NOT NULL,
                "shipping_address" character varying NOT NULL,
                "order_status" character varying NOT NULL DEFAULT 'pending',
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "userId" uuid,
                CONSTRAINT "PK_orders_order_id" PRIMARY KEY ("order_id"),
                CONSTRAINT "FK_orders_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL
            )
        `);

        // Create order_items table
        await queryRunner.query(`
            CREATE TABLE "order_items" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "quantity" integer NOT NULL,
                "price" numeric(10,2) NOT NULL,
                "orderId" uuid,
                "productId" uuid,
                CONSTRAINT "PK_order_items_id" PRIMARY KEY ("id"),
                CONSTRAINT "FK_order_items_orderId" FOREIGN KEY ("orderId") REFERENCES "orders"("order_id") ON DELETE CASCADE,
                CONSTRAINT "FK_order_items_productId" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE SET NULL
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "order_items"`);
        await queryRunner.query(`DROP TABLE "orders"`);
    }
}

