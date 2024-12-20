
// src/app.js

const express = require('express');
const cors = require('cors');  // Import the CORS middleware
require('dotenv').config();  // Load .env file
const authRoutes = require('./routes/auth').router;  // Import auth routes
const moviesRoutes = require('./routes/movies');  // Import auth routes
const cookieParser = require('cookie-parser');  // Import cookie-parser

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',  // Your client app's origin
  credentials: true  // Enable cookies and credentials in requests
}));
app.use(express.json());
app.use(cookieParser());
// Routes
app.use('/api', authRoutes);
app.use('/api', moviesRoutes);

// app.use((req, res, next) => {
//   console.log(`Unmatched route: ${req.method} ${req.url}`);  // Logs unmatched routes
//   res.status(404).json({ message: 'Route not found', method: req.method, url: req.url });
// });

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));









// async function getPopularMovies(limit = 10) {
//   try {
//     const connection = await pool.getConnection();
//     const [popularMovies] = await connection.query(
//       `SELECT id, title, genre, popularity
//        FROM movie
//        ORDER BY popularity DESC
//        LIMIT ?`, [limit]
//     );
//     connection.release();
//     return popularMovies;
//   } catch (error) {
//     console.error(error);
//     throw error;
//   }
// }

// async function getPersonalizedRecommendations(userId, lambda = 0.05, visitWeight = 5, unwantedGenres='') {
//   let connection;
//   try {
//     connection = await pool.getConnection();

//     // Step 1: Get user's interaction history (visits + ratings)
//     const [userVisits] = await connection.query(
//       'SELECT movie_id FROM user_history WHERE user_id = ?',
//       [userId]
//     );
//     const [userRatings] = await connection.query(
//       'SELECT movie_id, rating FROM user_ratings WHERE user_id = ?',
//       [userId]
//     );

//     const interactionCount = userVisits.length + userRatings.length;

//     // Step 2: If no interactions, return popular movies
//     if (interactionCount === 0) {
//       return await getPopularMovies(); // Fallback to popular movies
//     }

//     // Step 3: Calculate the weights for popular and personalized recommendations
//     const P_popular = Math.exp(-lambda * interactionCount);  // Popular movie weight decays as interactions increase
//     const P_personalized = 1 - P_popular;  // Personalized movie weight

//     const genreCounts = {};
//     const movieInteractions = {};  // To store merged visit/rating interactions

//     // Step 4: Process user visits
//     for (const { movie_id } of userVisits) {
//       if (!movieInteractions[movie_id]) {
//         movieInteractions[movie_id] = { type: 'visit', weight: visitWeight };
//       }
//     }

//     // Step 5: Process user ratings (ratings overwrite visits)
//     for (const { movie_id, rating } of userRatings) {
//       let ratingWeight;
//       if (rating > 5) {
//         ratingWeight = rating * Math.exp(rating * 0.1);  // Exponential growth for ratings > 5
//       } else if (rating > 1) {
//         ratingWeight = rating * Math.log(rating ** 0.6);  // Logarithmic decay for low ratings
//       } else {
//         ratingWeight = 0;  // Minimal influence for very low ratings
//       }
//       movieInteractions[movie_id] = { type: 'rating', weight: ratingWeight };  // Overwrite visit with rating
//     }

//     // Step 6: Apply weights to genres for each movie interaction
//     for (const movie_id in movieInteractions) {
//       const interaction = movieInteractions[movie_id];
//       const [movie] = await connection.query('SELECT genre FROM movie WHERE id = ?', [movie_id]);
//       const genres = movie[0].genre.split(',').map(g => g.trim());

//       genres.forEach(genre => {
//         genreCounts[genre] = (genreCounts[genre] || 0) + interaction.weight;
//       });
//     }

    // console.log("genres reccomendations:", genreCounts)
//     console.log("P_popular:", P_popular, "; P_personalized:", P_personalized)

//     // Step 7: Convert user's genre weights to string format
//     const genreWeightsString = Object.keys(genreCounts)
//       .map(genre => `${genre}:${Math.round(genreCounts[genre])}`)
//       .join(',');

//     console.log('genreWeightsString', genreWeightsString)
//     // Step 8: Get personalized movie recommendations based on genre preferences
//     const personalizedRecommendations = await connection.query(
//       `SELECT id, title, genre, 
//              calc_movie_score('${genreWeightsString}', genre, '${unwantedGenres}') AS score  -- Pass user's genre weights and movie genres
//        FROM movie 
//        WHERE id NOT IN (SELECT movie_id FROM user_history WHERE user_id = ?)  
//        ORDER BY score DESC 
//        LIMIT ? OFFSET ?`,
//       [userId, Math.ceil(10 * P_personalized), (page - 1) * pageSize]
//     );

//     // Log personalized recommendations with their scores
    // personalizedRecommendations[0].forEach(movie => {
    //   console.log(`Personalized: Movie ID: ${movie.id}, Title: ${movie.title}, Score: ${Math.round(movie.score)}`);
    // });

//     const popularRecommendations =  await getMoviesByGenres(Math.floor(10 * P_popular), page, pageSize);

//     // Combine personalized and popular recommendations
//     const recommendations = [
//       ...personalizedRecommendations[0].map(movie => ({ ...movie, type: 'personalized' })),
//       ...popularRecommendations.map(movie => ({ ...movie, type: 'popular' }))
//     ];

//     // Log final recommendations with types
//     recommendations.forEach(movie => {
//       console.log(`Recommended Movie: ${movie.title}, Type: ${movie.type}, Score: ${movie.score || 'N/A'}`);
//     });

//     return recommendations;

//   } catch (error) {
//     console.error('Error generating recommendations:', error);
//     throw error;
//   } finally {
//     if (connection) connection.release();
//   }
// }

// Running the recommendation algorithm
// (async () => {
//   const userId = '1';  // Replace with actual user ID
//   try {
//     const recommendations = await getMoviesByGenres("", 100);
//     console.log('Recommended Movies:', recommendations);
//   } catch (error) {
//     console.error('Error generating recommendations:', error);
//   }
// })();

// async function getMoviesByGenres(limit = 10, genres = '') {
//   try {
//     const connection = await pool.getConnection();

//     if (genres) {
//       const genreList = genres.split(",");
//       const minMatchCount = Math.min(2, genreList.length); // Now matching at least 2 genres

//       // Construct WHERE clause to check all genres in genreList
//       const genreConditions = genreList.map(() => `genre LIKE CONCAT('%', ?, '%')`).join(" OR ");
//       const genreMatchCases = genreList.map(() => `CASE WHEN genre LIKE CONCAT('%', ?, '%') THEN 1 ELSE 0 END`).join(" + ");
      
//       const genreQuery = `
//         SELECT id, title, genre, release_date, vote_count,
//                ( ${genreMatchCases} ) AS genre_match_count
//         FROM movie
//         WHERE (${genreConditions})
//         GROUP BY id
//         HAVING genre_match_count >= ?
//         ORDER BY release_date DESC, vote_count DESC
//         LIMIT ?`;

//       // Pass genreList twice, once for WHERE clause and once for SELECT count, then add minMatchCount and limit
//       const [movies] = await connection.query(genreQuery, [...genreList, ...genreList, minMatchCount, limit]);
//       connection.release();
//       return movies;
//     }

//     // If no genres provided, return most recent and popular movies
//     const [recentPopularMovies] = await connection.query(
//       `SELECT id, title, genre, release_date, vote_count
//        FROM movies
//        ORDER BY 
//           CASE 
//               WHEN release_date > DATE_SUB(CURDATE(), INTERVAL 2 YEAR) THEN 1 
//               ELSE 0 
//           END DESC, 
//           vote_count DESC
//        LIMIT ?`, [limit]
//     );
//     connection.release();
//     return recentPopularMovies;

//   } catch (error) {
//     console.error(error);
//     throw error;
//   }
// }




async function getPersonalizedRecommendations(userId, pageNum = 1, pageSize = 10, lambda = 0.05, visitWeight = 5, unwantedGenres = '') {
  let connection;
  try {
    connection = await pool.getConnection();

    // Step 1: Get user's interaction history (visits + ratings)
    const [userVisits] = await connection.query(
      'SELECT movie_id FROM user_history WHERE user_id = ?',
      [userId]
    );
    const [userRatings] = await connection.query(
      'SELECT movie_id, rating FROM user_ratings WHERE user_id = ?',
      [userId]
    );

    const interactionCount = userVisits.length + userRatings.length;

    // Step 2: If no interactions, return popular movies
    if (interactionCount === 0) {
      return await getMoviesByGenres(pageSize, pageNum); // Fallback to popular movies with pagination
    }

    // Step 3: Calculate the weights for popular and personalized recommendations
    const P_popular = Math.exp(-lambda * interactionCount);  // Popular movie weight decays as interactions increase
    const P_personalized = 1 - P_popular;  // Personalized movie weight

    const genreCounts = {};
    const movieInteractions = {};  // To store merged visit/rating interactions

    // Step 4: Process user visits
    for (const { movie_id } of userVisits) {
      if (!movieInteractions[movie_id]) {
        movieInteractions[movie_id] = { type: 'visit', weight: visitWeight };
      }
    }

    // Step 5: Process user ratings (ratings overwrite visits)
    for (const { movie_id, rating } of userRatings) {
      let ratingWeight;
      if (rating > 5) {
        ratingWeight = rating * Math.exp(rating * 0.1);  // Exponential growth for ratings > 5
      } else if (rating > 1) {
        ratingWeight = rating * Math.log(rating ** 0.6);  // Logarithmic decay for low ratings
      } else {
        ratingWeight = 0;  // Minimal influence for very low ratings
      }
      movieInteractions[movie_id] = { type: 'rating', weight: ratingWeight };  // Overwrite visit with rating
    }

    // Step 6: Apply weights to genres for each movie interaction
    for (const movie_id in movieInteractions) {
      const interaction = movieInteractions[movie_id];
      const [movie] = await connection.query('SELECT genre FROM movie WHERE id = ?', [movie_id]);
      const genres = movie[0].genre.split(',').map(g => g.trim());

      genres.forEach(genre => {
        genreCounts[genre] = (genreCounts[genre] || 0) + interaction.weight;
      });
    }

    // Step 7: Convert user's genre weights to string format
    const genreWeightsString = Object.keys(genreCounts)
      .map(genre => `${genre}:${Math.round(genreCounts[genre])}`)
      .join(',');

    // Calculate offset for pagination
    const offset = (pageNum - 1) * pageSize;

    // Step 8: Get personalized movie recommendations based on genre preferences
    const personalizedRecommendations = await connection.query(
      `SELECT id, title, genre, 
              calc_movie_score('${genreWeightsString}', genre, '${unwantedGenres}') AS score 
       FROM movie 
       WHERE id NOT IN (SELECT movie_id FROM user_history WHERE user_id = ?)  
       ORDER BY score DESC 
       LIMIT ? OFFSET ?`,
      [userId, pageSize, offset]
    );

    const popularRecommendations = await getMoviesByGenres(Math.floor(10 * P_popular), pageNum);

    // Combine personalized and popular recommendations
    const recommendations = [
      ...personalizedRecommendations[0].map(movie => ({ ...movie, type: 'personalized' })),
      ...popularRecommendations.map(movie => ({ ...movie, type: 'popular' }))
    ];

    return recommendations;

  } catch (error) {
    console.error('Error generating recommendations:', error);
    throw error;
  } finally {
    if (connection) connection.release();
  }
}


async function getMoviesByGenres(pageSize = 10, pageNum = 1, genres = '') {
  try {
    const connection = await pool.getConnection();

    const offset = (pageNum - 1) * pageSize;  // Calculate offset for pagination

    if (genres) {
      const genreList = genres.split(",");
      const minMatchCount = Math.min(2, genreList.length);

      const genreConditions = genreList.map(() => `genre LIKE CONCAT('%', ?, '%')`).join(" OR ");
      const genreMatchCases = genreList.map(() => `CASE WHEN genre LIKE CONCAT('%', ?, '%') THEN 1 ELSE 0 END`).join(" + ");
      
      const genreQuery = `
        SELECT id, title, genre, release_date, vote_count,
               ( ${genreMatchCases} ) AS genre_match_count
        FROM movie
        WHERE (${genreConditions})
        GROUP BY id
        HAVING genre_match_count >= ?
        ORDER BY release_date DESC, vote_count DESC
        LIMIT ? OFFSET ?`;

      const [movies] = await connection.query(genreQuery, [...genreList, ...genreList, minMatchCount, pageSize, offset]);
      connection.release();
      return movies;
    }

    // If no genres provided, return most recent and popular movies
    const [recentPopularMovies] = await connection.query(
      `SELECT id, title, genre, release_date, vote_count
       FROM movie
       ORDER BY 
          CASE 
              WHEN release_date > DATE_SUB(CURDATE(), INTERVAL 2 YEAR) THEN 1 
              ELSE 0 
          END DESC, 
          vote_count DESC
       LIMIT ? OFFSET ?`, [pageSize, offset]
    );
    connection.release();
    return recentPopularMovies;

  } catch (error) {
    console.error(error);
    throw error;
  }
}



// // Running the recommendation algorithm
// (async () => {
//   const userId = '3';  // Replace with actual user ID
//   try {
//     const recommendations = await getPersonalizedRecommendations(userId, 1, 12);
//     console.log('Recommended Movies:', recommendations);
//   } catch (error) {
//     console.error('Error generating recommendations:', error);
//   }
// })();