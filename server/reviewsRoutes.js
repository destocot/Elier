const reviewsRouter = require('express').Router();
const queries = require('./database/queries');
const mutations = require('./database/mutations');
require('dotenv').config();

// REDIS /////
const redis = require("redis");
const DEFAULT_EXPIRATION = 3600;
let redisPort = 6379;  // Replace with your redis port
let redisHost = "127.0.0.1";  // Replace with your redis host
const client = redis.createClient({
  socket: {
    port: redisPort,
    host: redisHost,
  }
});

(async () => {
  // Connect to redis server
  await client.connect();
})();




const axios = require('axios');

let productId = 32;

// reviewsRouter.get('/getAllReviews', async (req, res) => {
//   console.log('here');
//   try {
//     const reviews = await queries.getReviews(productId);
//     res.status(200).send(reviews);
//   } catch (error) {
//     res.status(404).send(error);
//   }
// });

reviewsRouter.get('/getAllReviews', async (req, res) => {

  try {
    const reviews = await getOrSetCache(`cachedreviews?productId=${productId}`, async () => {
      const fetchedReviews = await queries.getReviews(productId);
      return fetchedReviews;
    })
    res.status(200).send(reviews);
  } catch (error) {
    res.status(404).send(error);
  }
})

// reviewsRouter.get('/getRatings', async (req, res) => {
//   try {
//     const meta = await queries.getMeta(productId);
//     res.status(200).send(meta);
//   } catch (error) {
//     res.status(404).send(error);
//   }
// });

reviewsRouter.get('/getRatings', async (req, res) => {
  try {
    const meta = await getOrSetCache(`cachhedmeta?productId=${productId}`, async () => {
      const fetchedMeta = await queries.getMeta(productId);
      return fetchedMeta;
    })
    res.status(200).send(meta);
  } catch (error) {
    res.status(404).send(error);
  }
});

// cache check function /////
const getOrSetCache = async (key, cb) => {
  try {
    const cachedData = await client.get(key);
    if (cachedData !== null) {
      // console.log('CACHE HIT');
      return JSON.parse(cachedData);
    }
    // console.log('CACHE MISS');
    const fetchedData = await cb();
    await client.setEx(key, DEFAULT_EXPIRATION, JSON.stringify(fetchedData))
    return fetchedData;
  } catch (error) {
    throw error;
  }
}
/////////////////////////////


reviewsRouter.post('/reviews', (req, res) => {
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