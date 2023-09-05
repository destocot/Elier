const pool = require('./index.js');

const getReviews = async (productId) => {
  // const reviewsQuery = `
  // SELECT review.id as review_id, review.summary, review.body, review.reviewer_name, review.date, review.rating, review.helpfulness,
  // ARRAY_AGG(JSON_BUILD_OBJECT(
  //   'id', picture.id,
  //   'url', picture.url
  // )) AS photos
  // FROM review
  // LEFT JOIN picture
  // ON review.id = picture.review_id
  // WHERE product_id = ($1)
  // GROUP BY review.id`;
  const reviewsQuery = `SELECT * FROM GetReviewsForProduct($1);`
  const { rows } = await pool.query(reviewsQuery, [productId]);
  return rows;
};

const getMeta = async (product_id) => {
  const reccomendAndRatingQuery = 'SELECT recommend, rating FROM review WHERE product_id = ($1)';

  const { rows } = await pool.query(reccomendAndRatingQuery, [product_id]);
  const data = rows.reduce((accu, curr) => {
    const { recommend, rating } = curr;
    accu.recommended[recommend] += 1;
    accu.ratings[rating] += 1;
    return accu;
  }, { recommended: { false: 0, true: 0 }, ratings: { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 } });

  const reviewQuery = 'SELECT id from review WHERE product_id = ($1)';
  const reviews = await pool.query(reviewQuery, [product_id]);
  const reviewIds = reviews.rows.map((row) => row.id);

  const charReviewQuery = `
  SELECT value, name, ch.id
  FROM characteristic_review cr
  INNER JOIN characteristics ch
  ON cr.characteristic_id = ch.id
  WHERE review_id = ANY($1)
  `;

  const charReviewData = await pool.query(charReviewQuery, [reviewIds]);
  const sizeId = charReviewData.rows[0] || 1;
  const widthId = charReviewData.rows[1] || 2;
  const comfortId = charReviewData.rows[2] || 3;
  const qualityId = charReviewData.rows[3] || 4;

  const characteristics = charReviewData.rows.reduce((acc, row) => {
    if (row.name === 'Fit') {
      acc.Size.total += row.value;
      acc.Size.count += 1;
    } else if (row.name === 'Length') {
      acc.Width.total += row.value;
      acc.Width.count += 1;
    } else {
      acc[row.name].total += row.value;
      acc[row.name].count += 1;
    }
    return acc;
  }, {
    Size: { total: 0, count: 0 }, Width: { total: 0, count: 0 }, Comfort: { total: 0, count: 0 }, Quality: { total: 0, count: 0 }
  });
  characteristics.Size = {
    id: sizeId,
    value: characteristics.Size.total / characteristics.Size.count
  };
  characteristics.Width = {
    id: widthId,
    value: characteristics.Width.total / characteristics.Width.count
  }
  characteristics.Comfort = {
    id: comfortId,
    value: characteristics.Comfort.total / characteristics.Comfort.count
  }
  characteristics.Quality = {
    id: qualityId,
    value: characteristics.Quality.total / characteristics.Quality.count
  };

  return {
    product_id,
    ...data,
    characteristics
  }
}




module.exports = { getReviews, getMeta };

// function ver
// CREATE OR REPLACE FUNCTION GetReviewsForProduct(productId int)
// RETURNS TABLE (
//     review_id integer,
//     summary varchar(300),
//     body text,
//     reviewer_name varchar(150),
//     date date,
//     rating integer,
//     helpfulness integer,
//     photos json[]
// )
// LANGUAGE plpgsql
// AS
// $$
// BEGIN
//     RETURN QUERY (
//         SELECT
//             review.id as review_id,
//             review.summary,
//             review.body,
//             review.reviewer_name,
//             review.date,
//             review.rating,
//             review.helpfulness,
//             ARRAY_AGG(JSON_BUILD_OBJECT(
//                 'id', picture.id,
//                 'url', picture.url
//             )) AS photos
//         FROM review
//         LEFT JOIN picture
//         ON review.id = picture.review_id
//         WHERE product_id = productId
//         GROUP BY review.id
//     );
// END;
// $$;
