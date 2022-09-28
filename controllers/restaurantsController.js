const express = require('express');
const router = express.Router();
const Restaurant = require('../models-and-schemas/restaurant');
const { requireToken } = require('../middleware/auth')
const searchBuilder = require('../middleware/searchBuilder')

// Restaurant CRUD
// ========================================================================================================

// Index
// GET /restaurants
router.get('/', requireToken, (req, res, next) => {
  Restaurant.find({})
    .then((restaurants) => res.json(restaurants))
    .catch(next);
});

// Show
// GET /restaurants/:id
router.get('/:id', requireToken, (req, res, next) => {
  Restaurant.findById(req.params.id)
    .then((restaurants) => res.json(restaurants))
    .catch(next);
});

// Create
// POST /restaurants
router.post('/', requireToken, (req, res, next) => {
  Restaurant.create(req.body)
    .then((restaurant) => res.status(201).json(restaurant))
    .catch(next);
});

// Update
// PUT /restaurants/:id
router.put('/:id', requireToken, (req, res, next) => {
  Restaurant.findByIdAndUpdate(req.params.id, req.body, { new: true })
  .then((restaurant) => res.json(restaurant))
  .catch(next)
});

// Delete
// DELETE /restaurants/:id
router.delete('/:id', requireToken, (req, res, next) => {
  Restaurant.findByIdAndDelete(req.params.id)
   .then((restaurant) => res.json(restaurant))
   .catch(next)
});

// Search Results
// ========================================================================================================

// Get based on query parameters
// GET /restaurants/results/:searchString
router.get('/results/:searchString', requireToken, (req, res, next) => {
  const queryParamsRegEx = searchBuilder(req.query)
  const searchStringRegEx = { $regex: '.*' + req.params.searchString + '.*', $options: 'i' }

  // Determine whether search string, filters, or both were sent
  // ===========================================================

  // Only search string
  if(Object.keys(req.query).length === 0) {
    Restaurant.find({ 
      $or: [
        { name: searchStringRegEx }, 
        { 'categories.title': searchStringRegEx }
      ]
    })
    .then(restaurants => res.json(restaurants))
    .catch(next)
  // Only filters
  } else if(req.params.searchString === 'no-search-string') {
    Restaurant.find({ 
      $and: queryParamsRegEx 
    })
    .then(restaurants => res.json(restaurants))
    .catch(next)
  // Both search string and filters
  } else {
    Restaurant.find({ 
      $and: [
        { $or: [
            { name: searchStringRegEx }, 
            { 'categories.title': searchStringRegEx }
          ]
        }, 
        { $and: queryParamsRegEx }
      ]
    })
    .then(restaurants => res.json(restaurants))
    .catch(next)
  }

})

// Reviews
// ========================================================================================================

// Get by Restaurant ID
// GET /restaurants/:restaurantId/reviews
router.get('/:restaurantId/reviews', requireToken, (req, res, next) => {
  Restaurant.findById(req.params.restaurantId)
    .select('reviews')
    .then(reviews => res.json(reviews))
    .catch(next)
    console.log('got restaurant reviews')
})

// Create a Review
// POST /restaurants/:restaurantId/reviews
router.post('/:restaurantId/reviews', requireToken, (req, res, next) => {
  Restaurant.findById(req.params.restaurantId)
      .then(restaurant => {
        restaurant.reviews.push(req.body)
        restaurant.save()
        res.json(restaurant.reviews)
      })
      .catch(next)
      console.log('review created')
})

// Delete a Review
// DELETE /restaurants/:restaurantId/reviews/:reviewId
router.delete('/:restaurantId/reviews/:reviewId', requireToken, (req, res, next) => {
  Restaurant.findByIdAndUpdate(req.params.restaurantId, { $pull: { reviews: { _id: req.params.reviewId }}}, { new: true })
    .then(restaurant => res.json(restaurant.reviews))
    .catch(next)
})

module.exports = router;
