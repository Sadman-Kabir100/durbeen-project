import { MigrationInterface, QueryRunner } from "typeorm";

export class InitDelivery1738200000000 implements MigrationInterface {
  name = "InitDelivery1738200000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE shipments (
        id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_id                UUID NOT NULL UNIQUE REFERENCES orders(id) ON DELETE RESTRICT,
        courier_provider        VARCHAR(30) NOT NULL,
        courier_name            VARCHAR(100),
        tracking_number         VARCHAR(100),
        status                  VARCHAR(30) NOT NULL DEFAULT 'pending',
        estimated_delivery_at   TIMESTAMPTZ,
        actual_delivery_at      TIMESTAMPTZ,
        courier_metadata        JSONB,
        created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`CREATE INDEX idx_shipments_order_id ON shipments(order_id)`);
    await queryRunner.query(`CREATE INDEX idx_shipments_tracking_number ON shipments(tracking_number)`);

    await queryRunner.query(`
      CREATE TABLE shipment_tracking_events (
        id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        shipment_id   UUID NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
        status        VARCHAR(30) NOT NULL,
        location      VARCHAR(150),
        note          TEXT,
        source        VARCHAR(100) NOT NULL,
        occurred_at   TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(
      `CREATE INDEX idx_shipment_tracking_events_shipment_id ON shipment_tracking_events(shipment_id)`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS shipment_tracking_events`);
    await queryRunner.query(`DROP TABLE IF EXISTS shipments`);
  }
}
