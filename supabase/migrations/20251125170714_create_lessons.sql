CREATE TABLE lessons (
    id          SERIAL PRIMARY KEY,
    title       TEXT NOT NULL,
    order_index INT,
    slug        TEXT UNIQUE NOT NULL
);
