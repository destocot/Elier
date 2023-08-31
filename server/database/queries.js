const pool = require('./index.js');

const getReviews = async (productId) => {
  const reviewsQuery = `
  SELECT review.*, ARRAY_AGG(picture.id || ':' || picture.url) AS photos
  FROM review
  LEFT JOIN picture
  ON review.id = picture.review_id
  WHERE product_id = ($1)
  GROUP BY review.id`;
  const reviewsData = await pool.query(reviewsQuery, [productId]);
  const reviews = reviewsData.rows.map((row) => {
    let photos;
    if (row.photos[0] === null) {
      photos = null;
    } else {
      photos = row.photos.map((photo) => {
        const [id, url] = photo.split(':http');
        return { id, url: `http${url}` };
      });
    }
    return { ...row, review_id: row.id, date: new Date(Number(row.date)), photos }
  })
  return reviews;
};

const getMeta = async (product_id) => {
  const recommendQuery = 'SELECT recommend FROM review WHERE product_id = ($1)';
  const recommendData = await pool.query(recommendQuery, [product_id]);
  const recommended = recommendData.rows.reduce((accumulator, curr) => {
    accumulator[curr.recommend] += 1;
    return accumulator;
  }, { false: 0, true: 0 });

  const ratingQuery = 'SELECT rating FROM review WHERE product_id = ($1)';
  const ratingData = await pool.query(ratingQuery, [product_id]);
  const ratings = ratingData.rows.reduce((accumulator, curr) => {
    accumulator[curr.rating] += 1;
    return accumulator;
  }, { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 });

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
    ratings,
    recommended,
    characteristics
  };
}


module.exports = { getReviews, getMeta };