// src/config/db.js
const mysql = require('mysql2');

// Create a connection pool
const pool = mysql.createPool({
  host: 'localhost',       // Replace with your DB host
  user: 'root',            // Replace with your DB username
  password: 'root',        // Replace with your DB password
  database: 'movies',      // Replace with your DB name
  waitForConnections: true,
  connectionLimit: 10,     // Max number of connections in the pool
  queueLimit: 0
});

// Export a promise-based version of the connection pool
const db = pool.promise();

module.exports = db;
