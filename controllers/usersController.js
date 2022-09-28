const express = require('express');
const router = express.Router();
const User = require('../models-and-schemas/user')
const bcrypt = require('bcrypt')
const { requireToken, createUserToken } = require('../middleware/auth')

// User CRUD
// ========================================================================================================

// Index
// GET /users
router.get('/', requireToken, async (req, res, next) => {
    try {
        const users = await User.find({})
        res.json(users)
    } catch(err) {
        next(err)
    }
})

// Get user by ID
// GET /users/:id
router.get('/:id', requireToken, async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id)
        .populate('likedrestaurants')
        .populate('friends')
        .populate('messages')
        .populate('events.restaurant')
        .populate('events.participants')
        res.json(user)
    } catch(err) {
        next(err)
    }
})

// Get user by username
// GET /users/username/:username
router.get('/username/:username', requireToken, async (req, res, next) => {
    try {
        const user = await User.findOne({ username: req.params.username })
        .populate('likedrestaurants')
        .populate('friends')
        .populate('messages')
        .populate('events.restaurant')
        .populate('events.participants')
        res.json(user)
    } catch(err) {
        next(err)
    }
})

// Sign Up
// POST /users/signup
router.post('/signup', (req, res, next) => {
    bcrypt.hash(req.body.password, 10)
    .then(hash => ({
        username: req.body.username,
        email: req.body.email,
        password: hash
    }))
    .then(user => User.create(user))
    .then(user => res.status(201).json(user))
    .catch(next)
})

// Sign In
// POST /users/signin
router.post('/signin', (req, res, next) => {
    User.findOne({ username: req.body.username })
        .then(user => createUserToken(req, user))
        .then(token => res.json({ token }))
        .catch(next)
})

// Update
// PUT /users/:id
router.put('/:id', requireToken, async (req, res, next) => {
    console.log('get user by ID')
    try {
        const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {new: true})
        if (updatedUser) {
            res.json(updatedUser)
        } else {
            res.sendStatus(404)
        }
    } catch(err) {
        next(err)
    }
})

// Delete
// DELETE /users/:id
router.delete('/:id', requireToken, async (req, res, next) => {
    try{
        const deletedUser = await User.findByIdAndDelete(req.params.id)
        res.json(deletedUser)
    } catch(err) {
        next(err)
    }
})

// Friend Invites
// ========================================================================================================

// Create friend invite
// POST /users/:userId/friendInvites
router.post('/:userId/friendInvites', requireToken, (req, res, next) => {
    User.findById(req.params.userId)
        .then(user => {
            user.friendinvites.push(req.body)
            user.save()
            res.json(user)
        })
        .catch(next)
 })
 
 // Delete friend invite
 // DELETE /user/:userId/friendInvites/:inviteId
 router.delete('/:userId/friendInvites/:inviteId', requireToken, (req, res, next) => {
    User.findByIdAndUpdate(req.params.userId, { $pull: { friendinvites: { _id: req.params.inviteId}}}, { new: true })
       .then(user => res.json(user))
       .catch(next)
 })

// Friends
// ========================================================================================================

// Create friend
// POST /users/:userId/friends/:friendId
router.post('/:userId/friends/:friendId', requireToken, (req, res, next) => {
    User.findByIdAndUpdate(req.params.userId, { $push: { friends: req.params.friendId }}, { new: true })
        .then(user => {
            User.findByIdAndUpdate(req.params.friendId, { $push: { friends: req.params.userId }}, { new: true })
                .then(() => res.json(user))
            })
            .catch(next)
})

// Delete friend
// DELETE /users/:userId/friends/:friendId
router.delete('/:userId/friends/:friendId', requireToken, (req, res, next) => {
    User.findByIdAndUpdate(req.params.userId, { $pullAll: { friends: [req.params.friendId] }}, { new: true })
        .then(user => {
            User.findByIdAndUpdate(req.params.friendId, { $pullAll: { friends: [req.params.userId] }}, { new: true })
                .then(() => res.json(user))
            })
            .catch(next)
})

// Liked Restaurants
// ========================================================================================================

// Create Liked Restaurant
// POST /users/:userId/likedrestaurants/:restaurantId
router.post('/:userId/likedrestaurants/:restaurantId', requireToken, (req, res, next) => {
    User.findByIdAndUpdate(req.params.userId, { $push: { likedrestaurants: req.params.restaurantId }}, { new: true })
        .then(newLikedRestaurants => res.json(newLikedRestaurants))
        .catch(next)
        console.log('liked restaurant added')
})

// Delete Liked Restaurant
// DELETE /users/:userId/likedrestaurants/:restaurantId
router.delete('/:userId/likedrestaurants/:restaurantId', requireToken, (req, res, next) => {
    User.findByIdAndUpdate(req.params.userId, { $pullAll: { likedrestaurants: [req.params.restaurantId] }}, { new: true })
        .then(newLikedRestaurants => res.json(newLikedRestaurants))
        .catch(next)
    console.log('deleted liked restaurant')
})

// Messages
// ========================================================================================================

// Get message by User ID
// GET /users/:userId/messages
router.get('/:userId/messages', requireToken, (req, res, next) => {
    User.findById(req.params.userId)
        .select('messages')
        .then(messages => res.json(messages))
        .catch(next)
})

// Create message
// POST /users/:recipientId/messages
router.post('/:recipientId/messages', requireToken, (req, res, next) => {
    User.findById(req.params.recipientId)
       .then(user => {
         user.messages.push(req.body)
         user.save()
         res.json(user)
     })
       .catch(next)
 })
 
// Delete message
// DELETE /users/:userId/messages/:messageId
router.delete('/:userId/messages/:messageId', requireToken, (req, res, next) => {
    User.findByIdAndUpdate(req.params.userId, { $pull: { messages: { _id: req.params.messageId }}}, { new: true })
       .then(user => res.json(user))
       .catch(next)
 })

 // Events
// ========================================================================================================

// Create event
// POST /users/events/sender/:senderId/restaurant/:restaurantId
router.post('/events/sender/:senderId/restaurant/:restaurantId', requireToken, (req, res, next) => {
    User.findByIdAndUpdate(req.params.senderId, { $push: { events: {restaurant: req.params.restaurantId, participants: req.body.participants }}}, { new: true })
       .then(user => {
            console.log(req.body.participants)
            res.json(user)
       })
       .catch(next)
       console.log('event created')
 })

// Delete event
// Delete /users/events/:eventId/sender/:senderId
router.delete('/events/:eventId/sender/:senderId', requireToken, (req, res, next) => {
    User.findByIdAndUpdate(req.params.senderId, { $pull: { events: { _id: req.params.eventId} }}, { new: true })
        .then(user => res.json(user))
        .catch(next)
})

module.exports = router;




