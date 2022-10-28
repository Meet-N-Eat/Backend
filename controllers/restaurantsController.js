const express = require('express');
const router = express.Router();
const Restaurant = require('../models-and-schemas/restaurant');
const { requireToken } = require('../middleware/auth')
const searchBuilder = require('../middleware/searchBuilder')

// Restaurant CRUD
// ========================================================================================================

// Index
// GET /restaurants
router.get('/', (req, res, next) => {
  Restaurant.find({})
    .then((restaurants) => res.json(restaurants))
    .catch(next);
  console.log('Get all restaurants')
});

// Get RestaurantDetail
// GET /restaurants/:id

router.get('/:id', (req, res, next) => {
  Restaurant.findById(req.params.id)
    .then((restaurant) => {
      const data = {
        _id: restaurant._id,
        name: restaurant.name,
        image_url: restaurant.image_url,
        display_phone: restaurant.display_phone,
        price: restaurant.price,
        categories: restaurant.categories,
        location: {
          address1: restaurant.location.address1,
          city: restaurant.location.city,
          state: restaurant.location.state
        }
      }
      res.json(data)
    }) 
})

// Get Restaurant UserLikes
// GET /restaurants/:id/userLikes
router.get('/:id/userLikes', (req, res, next) => {
  Restaurant.findById(req.params.id)
    .populate('userLikes', 'displayname username')
    .then((restaurant) => res.json(restaurant.userLikes)) 
    .catch(next);
  console.log('Get restaurant by ID')
});


// Create
// POST /restaurants
router.post('/', (req, res, next) => {
  Restaurant.create(req.body)
    .then((restaurant) => res.status(201).json(restaurant))
    .catch(next);
  console.log('Create restaurant')
});

// Update
// PUT /restaurants/:id
router.put('/:id', (req, res, next) => {
  Restaurant.findByIdAndUpdate(req.params.id, req.body, { new: true })
    .then((restaurant) => res.json(restaurant))
    .catch(next)
  console.log('Update restaurant')
});

// Delete
// DELETE /restaurants/:id
router.delete('/:id', (req, res, next) => {
  Restaurant.findByIdAndDelete(req.params.id)
   .then((restaurant) => res.json(restaurant))
   .catch(next)
  console.log('Delete restaurant')
});

// Search Results
// ========================================================================================================

// Get based on query parameters
// GET /restaurants/results/:searchString
router.get('/results/:searchString', (req, res, next) => {
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
  console.log('Search results')

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
  console.log('review deleted')
})

module.exports = router;
