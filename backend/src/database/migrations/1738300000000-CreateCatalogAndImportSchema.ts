import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateCatalogAndImportSchema1738300000000 implements MigrationInterface {
  name = "CreateCatalogAndImportSchema1738300000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE categories (
        id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name       VARCHAR(255) NOT NULL UNIQUE,
        slug       VARCHAR(255) NOT NULL UNIQUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`CREATE INDEX idx_categories_name ON categories(name)`);

    await queryRunner.query(`
      CREATE TABLE authors (
        id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name       VARCHAR(255) NOT NULL UNIQUE,
        slug       VARCHAR(255),
        bio        TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`CREATE INDEX idx_authors_name ON authors(name)`);

    await queryRunner.query(`
      CREATE TABLE publishers (
        id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name       VARCHAR(255) NOT NULL UNIQUE,
        slug       VARCHAR(255),
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`CREATE INDEX idx_publishers_name ON publishers(name)`);

    await queryRunner.query(`
      CREATE TABLE products (
        id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name              VARCHAR(500) NOT NULL,
        slug              VARCHAR(500),
        description       TEXT,
        regular_price     NUMERIC(10,2) NOT NULL DEFAULT 0,
        sale_price        NUMERIC(10,2) NOT NULL DEFAULT 0,
        discount          NUMERIC(5,2) NOT NULL DEFAULT 0,
        stock_quantity    INT NOT NULL DEFAULT 100,
        image_url         TEXT,
        source_url        TEXT,
        source_product_id VARCHAR(255),
        category_id       UUID REFERENCES categories(id) ON DELETE SET NULL,
        author_id         UUID REFERENCES authors(id) ON DELETE SET NULL,
        publisher_id      UUID REFERENCES publishers(id) ON DELETE SET NULL,
        status            VARCHAR(20) NOT NULL DEFAULT 'active',
        created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`CREATE INDEX idx_products_name ON products(name)`);
    await queryRunner.query(
      `CREATE INDEX idx_products_source_product_id ON products(source_product_id) WHERE source_product_id IS NOT NULL`
    );
    await queryRunner.query(
      `CREATE INDEX idx_products_source_url ON products(source_url) WHERE source_url IS NOT NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS products`);
    await queryRunner.query(`DROP TABLE IF EXISTS publishers`);
    await queryRunner.query(`DROP TABLE IF EXISTS authors`);
    await queryRunner.query(`DROP TABLE IF EXISTS categories`);
  }
}
