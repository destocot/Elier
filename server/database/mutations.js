const pool = require('./index.js');

const postReviews = async (data, productId) => {
  const { rating, summary, body, recommend, name, email, helpfulness } = data;

  const date = Date.now();
  const values = [productId, rating, date, summary, body, recommend, false, name, email, null, 0];

  console.log(values);

  const query = `
    INSERT INTO review
    (product_id, rating, date, summary, body, recommend, reported, reviewer_name, reviewer_email, response, helpfulness)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11);
  `;
  const postReviewData = await pool.query(query, values);
}

const updateHelpfulness = async (reviewId) => {
  const query = `
    UPDATE review
      SET helpfulness = helpfulness + 1
      WHERE id = ($1)
  `;
  const updateHelpfulnessData = await pool.query(query, [reviewId]);
};

module.exports = { postReviews, updateHelpfulness };