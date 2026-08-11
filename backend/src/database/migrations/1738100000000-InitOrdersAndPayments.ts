import { MigrationInterface, QueryRunner } from "typeorm";

export class InitOrdersAndPayments1738100000000 implements MigrationInterface {
  name = "InitOrdersAndPayments1738100000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE orders (
        id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_number     VARCHAR(30) NOT NULL UNIQUE,
        user_id          UUID NOT NULL,
        address_id       UUID NOT NULL,
        status           VARCHAR(30) NOT NULL DEFAULT 'placed',
        subtotal         NUMERIC(10,2) NOT NULL,
        discount_amount  NUMERIC(10,2) NOT NULL DEFAULT 0,
        shipping_fee     NUMERIC(10,2) NOT NULL DEFAULT 0,
        total_amount     NUMERIC(10,2) NOT NULL,
        payment_method   VARCHAR(20) NOT NULL,
        payment_status   VARCHAR(20) NOT NULL DEFAULT 'pending',
        note             TEXT,
        placed_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
        created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`CREATE INDEX idx_orders_user_id ON orders(user_id)`);
    await queryRunner.query(`CREATE INDEX idx_orders_status ON orders(status)`);

    await queryRunner.query(`
      CREATE TABLE order_items (
        id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_id                  UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        product_id                UUID NOT NULL,
        product_title_snapshot    VARCHAR(500) NOT NULL,
        quantity                  INT NOT NULL CHECK (quantity > 0),
        unit_price                NUMERIC(10,2) NOT NULL,
        subtotal                  NUMERIC(10,2) NOT NULL
      )
    `);
    await queryRunner.query(`CREATE INDEX idx_order_items_order_id ON order_items(order_id)`);
    await queryRunner.query(`CREATE INDEX idx_order_items_product_id ON order_items(product_id)`);

    await queryRunner.query(`
      CREATE TABLE order_status_history (
        id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_id     UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        from_status  VARCHAR(30),
        to_status    VARCHAR(30) NOT NULL,
        changed_by   VARCHAR(100) NOT NULL,
        note         TEXT,
        changed_at   TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(
      `CREATE INDEX idx_order_status_history_order_id ON order_status_history(order_id)`
    );

    await queryRunner.query(`
      CREATE TABLE payments (
        id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_id                 UUID NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
        provider                 VARCHAR(20) NOT NULL,
        provider_transaction_id  VARCHAR(150),
        merchant_invoice_no      VARCHAR(50) NOT NULL UNIQUE,
        amount                   NUMERIC(10,2) NOT NULL,
        currency                 VARCHAR(3) NOT NULL DEFAULT 'BDT',
        status                   VARCHAR(20) NOT NULL DEFAULT 'pending',
        gateway_response         JSONB,
        failure_reason           TEXT,
        initiated_at             TIMESTAMPTZ NOT NULL,
        completed_at             TIMESTAMPTZ,
        created_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at               TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`CREATE INDEX idx_payments_order_id ON payments(order_id)`);
    await queryRunner.query(
      `CREATE INDEX idx_payments_provider_transaction_id ON payments(provider_transaction_id)`
    );
    await queryRunner.query(`CREATE INDEX idx_payments_status ON payments(status)`);

    await queryRunner.query(`
      CREATE TABLE refunds (
        id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        payment_id          UUID NOT NULL REFERENCES payments(id) ON DELETE RESTRICT,
        amount              NUMERIC(10,2) NOT NULL,
        reason              VARCHAR(30) NOT NULL,
        reason_note         TEXT,
        status              VARCHAR(20) NOT NULL DEFAULT 'pending',
        provider_refund_id  VARCHAR(150),
        requested_by        VARCHAR(100) NOT NULL,
        gateway_response    JSONB,
        requested_at        TIMESTAMPTZ NOT NULL,
        completed_at        TIMESTAMPTZ,
        created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`CREATE INDEX idx_refunds_payment_id ON refunds(payment_id)`);
    await queryRunner.query(`CREATE INDEX idx_refunds_status ON refunds(status)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS refunds`);
    await queryRunner.query(`DROP TABLE IF EXISTS payments`);
    await queryRunner.query(`DROP TABLE IF EXISTS order_status_history`);
    await queryRunner.query(`DROP TABLE IF EXISTS order_items`);
    await queryRunner.query(`DROP TABLE IF EXISTS orders`);
  }
}
