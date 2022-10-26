const express = require('express');
const router = express.Router();
const User = require('../models-and-schemas/user')
const Restaurant = require('../models-and-schemas/restaurant')
const bcrypt = require('bcrypt')
const { requireToken, createUserToken } = require('../middleware/auth');
const { default: mongoose } = require('mongoose');
const messageSchema = require('../models-and-schemas/message');

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
    console.log('Get all users')
})

// Get user by ID
// GET /users/:id
router.get('/:id', requireToken, async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id)
        .populate('favorites')
        // .populate('friends')
        .populate('messages')
        // .populate('events.restaurant')
        // .populate('events.participants')
        res.json(user)
    } catch(err) {
        next(err)
    }
    console.log('Get users by ID')
})

// Get user by username
// GET /users/username/:username
router.get('/username/:username', requireToken, async (req, res, next) => {
    try {
        const user = await User.findOne({ username: req.params.username })
        .populate('favorites')
        // .populate('friends')
        .populate('messages')
        // .populate('events.restaurant')
        // .populate('events.participants')
        res.json(user)
    } catch(err) {
        next(err)
    }
    console.log('Get users by username')
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
    console.log('Sign Up')
})

// Sign In
// POST /users/signin
router.post('/signin', (req, res, next) => {
    User.findOne({ username: req.body.username })
        .then(user => createUserToken(req, user))
        .then(token => res.json({ token }))
        .catch(next)
    console.log('Sign In')
})

// Update
// PUT /users/:id
router.put('/:id', requireToken, async (req, res, next) => {
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
    console.log('User updated')
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
    console.log('User deleted')
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
    console.log('Create friend invite')
 })
 
 // Delete friend invite
 // DELETE /users/:userId/friendInvites/:inviteId
 router.delete('/:userId/friendInvites/:inviteId', requireToken, (req, res, next) => {
    User.findByIdAndUpdate(req.params.userId, { $pull: { friendinvites: { _id: req.params.inviteId}}}, { new: true })
       .then(user => res.json(user))
       .catch(next)
    console.log('Delete friend invite')
 })

// Friends
// ========================================================================================================

// Get friends by User ID
// GET /users/:userId/friends
router.get('/:userId/friends', requireToken, (req, res, next) => {
    User.findById(req.params.userId)
        .select('friends')
        .populate('friends')
        .then(friends => res.json(friends))
        .catch(next)
    console.log('Get friends')
})

// Create friend
// POST /users/:userId/friends/:friendId
router.post('/:userId/friends/:friendId', requireToken, (req, res, next) => {
    User.findByIdAndUpdate(req.params.userId, { $push: { friends: req.params.friendId }}, { new: true })
        .then(user => {
            User.findByIdAndUpdate(req.params.friendId, { $push: { friends: req.params.userId }}, { new: true })
                .then(() => res.json(user))
            })
            .catch(next)
    console.log('Create friend')
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
    console.log('Delete friend')
})

// Favorite Restaurants
// ========================================================================================================

// Add to Favorite Restaurants
// POST /users/:userId/favorites/:restaurantId
router.post('/:userId/favorites/:restaurantId', requireToken, (req, res, next) => {
    User.findByIdAndUpdate(req.params.userId, { $push: { favorites: req.params.restaurantId }}, { new: true })
        .populate('favorites')
        // .populate('friends')
        .populate('messages')
        // .populate('events.restaurant')
        // .populate('events.participants')
        .then(user => res.json(user))
        .then(() => Restaurant.findByIdAndUpdate(req.params.restaurantId, { $push: {userLikes: req.params.userId}} ))
        .catch(next)
    console.log('liked restaurant added')
})

// Delete from Favorite Restaurants
// DELETE /users/:userId/favorites/:restaurantId
router.delete('/:userId/favorites/:restaurantId', requireToken, (req, res, next) => {
    User.findByIdAndUpdate(req.params.userId, { $pullAll: { favorites: [req.params.restaurantId] }}, { new: true })
        .populate('favorites')
        // .populate('friends')
        .populate('messages')
        // .populate('events.restaurant')
        // .populate('events.participants')
        .then(user => res.json(user))
        .then(() => Restaurant.findByIdAndUpdate(req.params.restaurantId, { $pullAll: { userLikes: [req.params.userId] }} ))
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
    console.log('Get message by User ID')
})

// Get all message threads
// GET /users/:userId/messages/all
router.get('/:userId/messages/all', requireToken, (req, res, next) => {
    User.find({ 
        $or: [
            { "messages.sender": req.params.userId },
            { "messages.recipient": req.params.userId }
        ]
    })
        .then(users => {
            let messages = []
            users.forEach(user => {
                messages = [...messages, ...user.messages.filter(message => message.sender == req.params.userId || message.recipient == req.params.userId)]
            })
            res.json(messages)
        })
        .catch(next)
    console.log('Get all message threads')
})

// Get single thread
// GET /users/:userId/messages/:friendId
router.get('/:userId/messages/:friendId', requireToken, (req, res, next) => {
    User.find({
        $or: [
            { _id: req.params.userId },
            { _id: req.params.friendId }
        ]
    })
        .then(users => {
            let messages = []
            users.forEach(user => {
                messages = [...messages, ...user.messages.filter(message => message.sender == req.params.userId || message.sender == req.params.friendId)]
            })
            res.json(messages)
        })
        .catch(next)
})

// Create message
// POST /users/messages/new
router.post('/messages/new', requireToken, (req, res, next) => {
    User.findById(req.body.recipient)
       .then(user => {
         user.messages.push(req.body)
         user.save()
         res.json(user)
     })
       .catch(next)
    console.log('Create message')
 })
 
// Delete message
// DELETE /users/:userId/messages/:messageId
router.delete('/:userId/messages/:messageId', requireToken, (req, res, next) => {
    User.findByIdAndUpdate(req.params.userId, { $pull: { messages: { _id: req.params.messageId }}}, { new: true })
       .then(user => res.json(user))
       .catch(next)
    console.log('Delete message')
 })

// Events
// ========================================================================================================
// Get event by User ID
// GET /users/:userId/events
router.get('/:userId/events', requireToken, (req, res, next) => {
    User.findById(req.params.userId)
        .select('events')
        .populate('events.restaurant')
        .populate('events.participants')
        .populate('events.createdBy')
        .then(events => res.json(events))
        .catch(next)
    console.log('Get event by User ID')
})
// Create event
// POST /users/events/create
router.post('/events/create', requireToken, (req, res, next) => {
    User.find({ _id: { $in: req.body.participants } })
        .then(participants => {
            const event = { ...req.body, _id: new mongoose.Types.ObjectId }

            participants.forEach(participant => {
                participant.events.push(event)
                participant.save()
            })

            const creator = participants.find(participant => participant._id == event.createdBy)
            creator
                .populate('favorites friends messages')
                .then(creator => res.json(creator))
        })
        .catch(next)
    console.log('Event created')
 })

// Edit event - Must send eventId field in event from frontend, _id for event won't work across all participants
// PUT /users/events/edit
router.put('/events/edit', requireToken, (req, res, next) => {
    // Get all users with the event
    User.find({ 'events._id': req.body._id })
        .then(users => {
            // Delete event for users that do not appear in participants list
            users.forEach(user => {
                if(!(req.body.participants.find(participantId => participantId == user._id))) {
                    user.events = user.events.filter(event => event._id != req.body._id)
                    user.save()
                }
            })

            // Get all participants
            User.find({ _id: { $in: req.body.participants } })
                .then(participants => {
                    // Edit event for participants already invited, or add event for new participants
                    participants.forEach(participant => {
                        const index = participant.events.findIndex(event => event._id == req.body._id)
                        
                        index != -1 ? participant.events[index] = req.body : participant.events.push(req.body)
                        participant.save()
                    })

                    const creator = participants.find(participant => participant._id == req.body.createdBy)
                    creator
                        .populate('favorites friends messages')
                        .then(creator => res.json(creator))
                })
        })
    .catch(next)
    console.log('Event updated')
})

// Delete event - Must send eventId field in event from frontend, _id for event won't work across all participants
// Delete /users/events/:eventId
router.delete('/events/:eventId', requireToken, (req, res, next) => {
    User.find({ 'events._id': req.params.eventId })
        .then(users => {
            users.forEach(user => {
                user.events = user.events.filter(event => event._id != req.params.eventId)
                user.save()
            })
            res.send('Event deleted')
        })
        .catch(next)
    console.log('Event deleted')
})

module.exports = router;




