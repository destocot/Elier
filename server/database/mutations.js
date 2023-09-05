const pool = require('./index.js');

const postReviews = async (data, productId) => {
  const { rating, summary, body, recommend, name, email, helpfulness, characteristics } = data;
  const values = [productId, rating, new Date().toISOString(), summary, body, recommend, false, name, email, null, 0];

  const query = `
    INSERT INTO review
    (product_id, rating, date, summary, body, recommend, reported, reviewer_name, reviewer_email, response, helpfulness)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    RETURNING id, summary
  `;
  const postReviewData = await pool.query(query, values);
  const reviewId = postReviewData.rows[0].id;

  let charValue = Object.values(characteristics)[0];
  let characteristicQuery = `INSERT INTO characteristics (product_id, name) VALUES ($1, $2) RETURNING id`;
  let charReviewQuery = `INSERT INTO characteristic_review (characteristic_id, review_id, value) VALUES ($1, $2, $3)`;
  const names = ['Fit', 'Length', 'Comfort', 'Quality'];
  let charData;
  let charId;
  if (charValue) {
    for (let name of names) {
      charData = await pool.query(characteristicQuery, [productId, name]);
      charId = charData.rows[0].id;
      charRevData = await pool.query(charReviewQuery, [charId, reviewId, charValue]);
    }
  } else {
    charValue = Math.floor(Math.random() * 5) + 1;
    for (let name of names) {
      charData = await pool.query(characteristicQuery, [productId, name]);
      charId = charData.rows[0].id;
      charRevData = await pool.query(charReviewQuery, [charId, reviewId, charValue]);
    }
  }

  return reviewId;
}

const updateHelpfulness = async (reviewId) => {
  const query = `
    UPDATE review
      SET helpfulness = helpfulness + 1
      WHERE id = ($1)
      RETURNING helpfulness
  `;
  const updateHelpfulnessData = await pool.query(query, [reviewId]);
  return updateHelpfulnessData.rows[0].helpfulness;
};

module.exports = { postReviews, updateHelpfulness };