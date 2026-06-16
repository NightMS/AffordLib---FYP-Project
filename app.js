require('dotenv').config();
const express = require('express');
const session = require('express-session'); // make sure session is used
const app = express();
const authRoutes = require('./routes/auth');
const path = require('path');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false }));

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));

app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.admin = req.session.admin || null;
  next();
});


app.use((req, res, next) => {
  res.locals.errorMessage = req.session.errorMessage || null;
  res.locals.successMessage = req.session.successMessage || null;
  delete req.session.errorMessage;
  delete req.session.successMessage;
  next();
});

app.use((req, res, next) => {
  res.locals.user = req.session.user;
  res.locals.successMessage = req.session.successMessage;
  delete req.session.successMessage;
  next();
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => {
  res.render('home'); // or index.ejs, etc.
});


// ✅ Routes must be registered AFTER the middleware
app.use('/', authRoutes);

// Start server last
app.listen(3000, () => console.log('Server running on port 3000'));
