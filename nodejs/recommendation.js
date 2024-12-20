const mysql = require('mysql2/promise');

// Create a MySQL connection pool
const pool = mysql.createPool({
  host: 'localhost',       // Replace with your DB host
  user: 'root',    // Replace with your DB username
  password: 'root',// Replace with your DB password
  database: 'movies'        // Replace with your DB name
});









// Running the recommendation algorithm
(async () => {
  const userId = '3';  // Replace with actual user ID
  try {
    console.log("page1")
    const recommendations = await getPersonalizedRecommendations(userId, 1, 24);
    console.log("len", recommendations.length)
    // console.log("page2")
    // const recommendations2 = await getPersonalizedRecommendations(userId, 2, 12);
    // console.log("len", recommendations2.length)
    // console.log('Recommended Movies:', recommendations);
  } catch (error) {
    console.error('Error generating recommendations:', error);
  }
})();
