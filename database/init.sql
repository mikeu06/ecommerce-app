-- This file can optionally be used to seed the database.
-- Think about WHERE/HOW this script should be mounted into the PostgreSQL
-- container so it runs automatically on first startup.

CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price NUMERIC(10, 2) NOT NULL
);

INSERT INTO products (name, price) VALUES
    ('Wireless Mouse', 19.99),
    ('Mechanical Keyboard', 49.99),
    ('USB-C Hub', 29.99),
    ('Laptop Stand', 24.50)
ON CONFLICT DO NOTHING;

-- Demo cart (single global cart, no auth/session) -- created here for
-- clarity, though Hibernate's ddl-auto=update would also create it.
CREATE TABLE IF NOT EXISTS cart_items (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id),
    quantity INTEGER NOT NULL CHECK (quantity > 0)
);
