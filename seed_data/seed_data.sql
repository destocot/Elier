-- psql -h localhost -U postgres  -f seed_data.sql

-- CREATE DATABASE postgres;

-- after creating database postgres change into it
\c postgres;

-- DROP TABLE picture;
-- DROP TABLE review;
-- DROP TABLE characteristics;
-- DROP TABLE characteristic_review;


-- CREATE TABLE picture(
--   id SERIAL PRIMARY KEY,
--   review_id INTEGER NOT NULL,
--   url VARCHAR(255) NOT NULL
-- );

-- CREATE TABLE review(
--     id SERIAL PRIMARY KEY,
--     product_id INTEGER NOT NULL,
--     rating INTEGER NOT NULL,
--     old_date BIGINT NOT NULL,
--     summary  VARCHAR(300),
--     body TEXT,
--     recommend BOOLEAN,
--     reported BOOLEAN,
--     reviewer_name VARCHAR(150),
--     reviewer_email VARCHAR(150),
--     response  VARCHAR(150),
--     helpfulness INTEGER NOT NULL
-- );

-- CREATE TABLE characteristics(
--   id SERIAL PRIMARY KEY,
--   product_id INTEGER NOT NULL,
--   name VARCHAR(10)
-- );

-- CREATE TABLE characteristic_review(
--   id SERIAL PRIMARY KEY,
--   characteristic_id INTEGER NOT NULL,
--   review_id INTEGER NOT NULL,
--   value INTEGER NOT NULL
-- );

-- \copy picture (id, review_id, url) FROM './seed_data/reviews_photos.csv' WITH (FORMAT csv, HEADER);

-- \copy review (id, product_id, rating, old_date, summary, body, recommend, reported, reviewer_name, reviewer_email, response, helpfulness) FROM './seed_data/reviews.csv' WITH (FORMAT csv, HEADER);

-- ALTER TABLE review
-- ADD COLUMN date DATE;

-- UPDATE review
-- SET date = DATE_TRUNC('day', TIMESTAMP 'epoch' + (old_date / 1000) * INTERVAL '1 second');

-- ALTER TABLE review
-- DROP COLUMN old_date;

-- \copy characteristics (id, product_id, name) FROM './seed_data/characteristics.csv' WITH (FORMAT csv, HEADER);

-- \copy characteristic_review (id, characteristic_id, review_id, value) FROM './seed_data/characteristic_reviews.csv' WITH (FORMAT csv, HEADER);

-- SELECT setval( pg_get_serial_sequence('picture', 'id'),
--                (SELECT max(id) from picture) );

-- SELECT setval( pg_get_serial_sequence('review', 'id'),
--                (SELECT max(id) from review) );

-- SELECT setval( pg_get_serial_sequence('characteristics', 'id'),
--                (SELECT max(id) from characteristics) );

-- SELECT setval( pg_get_serial_sequence('characteristic_review', 'id'),
--                (SELECT max(id) from characteristic_review) );

-- CREATE INDEX review_index ON picture(review_id);
-- CREATE INDEX product_index ON review(product_id);
-- CREATE INDEX ch_review_index ON characteristic_review(review_id);

CREATE OR REPLACE FUNCTION GetReviewsForProduct(productId int)
RETURNS TABLE (
    review_id integer,
    summary varchar(300),
    body text,
    reviewer_name varchar(150),
    date date,
    rating integer,
    helpfulness integer,
    photos json[]
)
LANGUAGE plpgsql
AS
$$
BEGIN
    RETURN QUERY (
        SELECT
            review.id as review_id,
            review.summary,
            review.body,
            review.reviewer_name,
            review.date,
            review.rating,
            review.helpfulness,
            ARRAY_AGG(JSON_BUILD_OBJECT(
                'id', picture.id,
                'url', picture.url
            )) AS photos
        FROM review
        LEFT JOIN picture
        ON review.id = picture.review_id
        WHERE product_id = productId
        GROUP BY review.id
    );
END;
$$;
