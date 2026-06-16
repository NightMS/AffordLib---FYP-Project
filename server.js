// Import modules
const express = require('express');
const mysql = require('mysql2');
const session = require('express-session');
const path = require('path');
require('dotenv').config(); // For .env variables

// Create express app
const app = express();

// Middlewares
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Session config
app.use(session({
  secret: 'your_secret_key', // You can change this
  resave: false,
  saveUninitialized: true
}));

// Set port
const PORT = process.env.PORT || 3000;

// Connect to MySQL database
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
});

db.connect((err) => {
  if (err) {
    console.error('❌ DB connection failed:', err);
  } else {
    console.log('✅ Connected to MySQL database');
  }
});

// Make db accessible globally
app.locals.db = db;

// Routes
const authRoutes = require('./routes/auth');
app.use('/', authRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});