const reviewsRouter = require('express').Router();
const queries = require('./database/queries');
const mutations = require('./database/mutations');
require('dotenv').config();

const axios = require('axios');

let productId = 27;

reviewsRouter.get('/getAllReviews', async (req, res) => {
  const reviews = await queries.getReviews(productId);
  res.send(reviews);
});

reviewsRouter.get('/getRatings', async (req, res) => {
  const meta = await queries.getMeta(productId);
  res.send(meta);
})

reviewsRouter.post('/reviews', (req, res) => {
  const requestData = req.body;
  mutations.postReviews(requestData, productId);
  res.send();
});

reviewsRouter.put('/updateHelpful/:review_id', (req, res) => {
  const reviewId = req.params.review_id;
  mutations.updateHelpfulness(reviewId);
  res.send();
});

module.exports = reviewsRouter;