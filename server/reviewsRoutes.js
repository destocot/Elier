const reviewsRouter = require('express').Router();
const queries = require('./database/queries');
const mutations = require('./database/mutations');
require('dotenv').config();

const axios = require('axios');

let productId = 34;

reviewsRouter.get('/getAllReviews', async (req, res) => {
  const reviews = await queries.getReviews(productId);
  res.status(200).send(reviews);
});

reviewsRouter.get('/getRatings', async (req, res) => {
  const meta = await queries.getMeta(productId);
  res.status(200).send(meta);
})

reviewsRouter.post('/reviews', (req, res) => {
  console.log('here', req.body);
  const requestData = req.body;
  mutations.postReviews(requestData, productId);
  res.status(201).send(`Successfully posted new review to ${productId}`);
});

reviewsRouter.put('/updateHelpful/:review_id', (req, res) => {
  const reviewId = req.params.review_id;
  mutations.updateHelpfulness(reviewId);
  res.status(202).send(`${reviewId} helpfulness has been successfully update`);
});

module.exports = reviewsRouter;