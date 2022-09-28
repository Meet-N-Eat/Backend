// Basic config

const express = require('express');
const app = express();
require('dotenv').config();
app.set('port', process.env.PORT || 8000);
const cors = require('cors');

// Middleware

app.use(cors())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ROUTES
/// Redirect
app.get('/', (req, res) => {
  res.redirect('/restaurants');
});

/// Controllers
const usersController = require('./controllers/usersController');
app.use('/users', usersController);

const restaurantsController = require('./controllers/restaurantsController');
app.use('/restaurants', restaurantsController);

// Error handle
app.use((err, req, res, next) => {
  const statusCode = res.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  res.status(statusCode).send(message);
});

// Start server
app.listen(app.get('port'), () => {
  console.log(`✅ PORT: ${app.get('port')} 🌟`);
});
