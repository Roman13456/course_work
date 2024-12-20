const express = require('express');
const router = express.Router();
const db = require('../config/db'); 
require('dotenv').config();
const fs = require('fs');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
// movies.js
const {authenticateToken} = require('./auth');  // Adjust path as needed


// GET /movies?page=1&limit=10
// GET /movies?page=1&limit=10&sortParameter=popularity&sortOrder=desc
router.get('/movies', async (req, res) => {
  const { page = 1, limit = 10, sortParameter, sortOrder, genre} = req.query;
  const offset = (page - 1) * limit;


  // console.log(sortParameter,sortOrder, typeof(sortParameter))
  try {
      // Start constructing the query with pagination
      let query = 'SELECT movie.* FROM movie';

      // Add join clause if filtering by genre
      if (genre) {
        query += ' JOIN movie_genre mg ON movie.id = mg.movie_id JOIN genre g ON mg.genre_id = g.id WHERE g.name = ?';
      }
      
      // Add sorting if both parameters are provided
      if (sortParameter && sortOrder) {
        query += ` ORDER BY ${db.escapeId(sortParameter)} ${sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC'}`;
      }

      // Add pagination
      query += ' LIMIT ? OFFSET ?';

      // Prepare parameters for the query
      const queryParams = [];
      if (genre) queryParams.push(genre);
      queryParams.push(parseInt(limit), offset);

      // Fetch movies with pagination and optional sorting
      const [movies] = await db.query(query, queryParams);

      // Fetch total movie count for pagination (with genre filter)
      let countQuery = 'SELECT COUNT(*) AS total FROM movie';
      if (genre) {
          countQuery += ' JOIN movie_genre mg ON movie.id = mg.movie_id JOIN genre g ON mg.genre_id = g.id WHERE g.name = ?';
      }

      // Fetch total movie count for pagination
      const [totalMovies] = await db.query(countQuery, genre ? [genre] : []);
      const totalPages = Math.ceil(totalMovies[0].total / limit);

      res.status(200).json({
          success: true,
          movies,
          totalPages,
          currentPage: parseInt(page),
      });
  } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Failed to fetch movies' });
  }
});
  

const { Client } = require('@elastic/elasticsearch');
const { error } = require('console');
const client = new Client({ node: process.env.SEARCH_ENGINE });

// New search endpoint
router.get('/movies/search', async (req, res) => {
  const { query, page = 1, limit = 10, sortParameter, sortOrder } = req.query;

  // Elasticsearch pagination offset
  const from = (page - 1) * limit;

  try {
    // Step 1: Build the sort part for Elasticsearch based on the sortParameter and sortOrder
    let esSort = [];

    // console.log("params:",sortParameter,sortOrder, typeof(sortParameter))
    console.log(sortParameter,sortOrder, typeof(sortParameter))
    if (sortParameter && sortOrder) {
      esSort = [
        { [sortParameter]: { order: sortOrder.toLowerCase() === 'asc' ? 'asc' : 'desc' } }
      ];
    } else {
      // Default sort by relevance (Elasticsearch's scoring)
      esSort = [{ _score: 'desc' }];
    }
    const esResponse = await client.search({
      index: 'movies',
      body: {
        query: {
          bool: {
            should: [
              {
                multi_match: {
                  query: query,
                  fields: ['title^3'],  // Title field with no minimum_should_match
                  fuzziness: 'AUTO',
                  type: 'best_fields'
                }
              },
              {
                multi_match: {
                  query: query,
                  fields: ['description'],  // Apply minimum_should_match to description
                  fuzziness: 'AUTO',
                  minimum_should_match: "2<75%",  // At least 2 terms or 75% if fewer words in query
                  type: 'best_fields'
                }
              },
              {
                multi_match: {
                  query: query,
                  fields: ['genre'],  // Simple match for genre
                  fuzziness: 'AUTO'
                }
              },
              {
                match_phrase: {
                  title: {
                    query: query,
                    slop: 2  // Allow small flexibility in word order in title
                  }
                }
              },
              {
                match_phrase: {
                  description: {
                    query: query,
                    slop: 3  // Allow small flexibility in word order in description
                  }
                }
              }
            ]
          }
        },
        from: from,   // Pagination offset
        size: limit,  // Number of results to return
        sort: esSort  // Apply sorting
      }
    });
    
    

    // Step 3: Extract movie IDs from Elasticsearch hits
    const movieIds = esResponse.hits.hits.map(hit => hit._id);  // Get movie IDs

    if (movieIds.length === 0) {
      return res.status(200).json({ total: 0, movies: [], totalPages: 0, currentPage: page});
    }

    // Step 4: Query MySQL for full movie details
    const [movies] = await db.query(
      'SELECT * FROM movie WHERE id IN (?) ORDER BY FIELD(id, ?)', 
      [movieIds, movieIds]
    );

    // Step 5: Send response back with movies and total count
    res.status(200).json({
      total: esResponse.hits.total.value,  // Total number of results
      movies,  // Movies data
      totalPages: Math.ceil(esResponse.hits.total.value / limit),  // Calculate total pages
      currentPage: page
    });
  } catch (error) {
    console.error('Error searching for movies:', error);
    res.status(500).json({ message: 'Server error while searching for movies' });
  }
});


// GET /movies/:id
router.get('/movies/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Fetch the movie from the database by its ID
    const [movie] = await db.query('SELECT * FROM movie WHERE id = ?', [id]);

    if (movie.length === 0) {
      return res.status(404).json({ success: false, message: 'Movie not found' });
    }

    // Fetch the genres associated with the movie
    const [genres] = await db.query(
      `SELECT g.name, g.id
       FROM genre g
       JOIN movie_genre mg ON g.id = mg.genre_id
       WHERE mg.movie_id = ?`,
      [id]
    );

    // Map the genres to an array of names
    const genreNames = genres.map(genre => {
      return{ 
        name:genre.name, 
        id:genre.id
      }
    });

    // Add the genres to the movie object
    movie[0].genres = genreNames;


    res.status(200).json({ success: true, movie: movie[0] });  // Return the first (and only) result
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});



//Cloudinary images upload/delete 
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Serve static files from the "public" directory
// app.use(express.static('public'));


// Multer middleware to handle file uploads
const upload = multer({ dest: 'uploads/' });

// Upload endpoint
router.post('/upload', upload.single('file'), (req, res) => {
  console.log("Received file:", req.file); // Log the file details
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const file = req.file;

  // Upload file to Cloudinary with transformation
  cloudinary.uploader.upload(file.path, { 
    folder: 'uploads',
    transformation: [
      { width: 500, height: 750, crop: "fill",  gravity: "center"  }
    ]
  }, (error, result) => {
    if (error) {
      console.error('Upload failed:', error);
      res.status(569).json({ error: 'Upload failed' });
    } else {
      console.log('Upload successful:', result);

      // Delete local file after successful upload
      fs.unlink(file.path, (err) => {
        if (err) console.error('Error deleting file:', err);
      });

      // Send Cloudinary response to client
      res.json(result);
    }
  });
});


router.delete('/delete/:publicId', (req, res) => {
  const publicId = req.params.publicId;

  // Delete image from Cloudinary
  cloudinary.uploader.destroy(publicId, (error, result) => {
    if (error) {
      // console.error('Delete failed:', error);
      res.status(500).json({ error: 'Delete failed' });
    } else {
      // console.log('Delete successful:', result);
      res.json(result);
    }
  });
});









  // POST /movies
router.post('/movies', async (req, res) => {
    const { title, description, genres, image, release_date, vote_average, vote_count } = req.body;
  
    if (!title || !description || !genres.length || !release_date) {
      console.log('Missing required fields' )
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }
    try {

      // throw error("req.body",req.body)

      // Convert genres array to a comma-separated string for the `movie` table
      const genreString = genres.map(genreObj => genreObj.name).join(',');

      // Extract genre IDs directly from the input array
      const genreIds = genres.map(genreObj => genreObj.id);

      const [result] = await db.query(
        'INSERT INTO movie (title, description, genre, image, release_date, vote_average, vote_count) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [title, description, genreString, image, release_date, vote_average, vote_count]
      );

      const newMovieId = result.insertId;

      // Insert associated genres into the `movie_genre` table
      const genreInsertValues = genreIds.map(genreId => [newMovieId, genreId]);
      await db.query('INSERT INTO movie_genre (movie_id, genre_id) VALUES ?', [genreInsertValues]);
      
      const newMovie = {
        id: newMovieId,
        title,
        description,
        genre: genreString,
        image,
        release_date,
        vote_average,
        vote_count,
      };
      // Add the new movie to Elasticsearch
      await client.index({
        index: 'movies',
        id: newMovie.id.toString(), // Elasticsearch document ID
        body: {
          id: newMovie.id, // This will store `id` as part of the document content in `_source`
          title: newMovie.title,
          description: newMovie.description,
          genre: newMovie.genre,
          image: newMovie.image,
          release_date: newMovie.release_date,
          vote_average: newMovie.vote_average,
          vote_count: newMovie.vote_count,
        }
      });
  
      res.status(201).json({ success: true, movie: newMovie, message: "Movie added successfully"});
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Failed to add movie' });
    }
  });
  

  // PUT /movies/:id
router.put('/movies/:id', async (req, res) => {
    const { id } = req.params;
    const { title, description, genres, image, release_date, vote_average, vote_count } = req.body;

    if (!genres) {
      return res.status(400).json({ success: false, message: 'Genres are required' });
    } 

    try {

      // throw error("req.body",req.body)
      // Convert genres array to a comma-separated string for the `movie` table
      const genreString = genres.map(genreObj => genreObj.name).join(',');

      // Extract genre IDs directly from the input array
      const genreIds = genres.map(genreObj => genreObj.id);

      // Update the movie in the `movie` table
      const [result] = await db.query(
        'UPDATE movie SET title = ?, description = ?, genre = ?, image = ?, release_date = ?, vote_average = ?, vote_count = ? WHERE id = ?',
        [title, description, genreString, image, release_date, vote_average, vote_count, id]
      );
  
      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: 'Movie not found' });
      }

      // Get current genres for the movie
      const [currentGenres] = await db.query('SELECT genre_id FROM movie_genre WHERE movie_id = ?', [id]);
      const currentGenreIds = currentGenres.map(g => g.genre_id);

      // Find genres to remove and genres to add
      const genresToRemove = currentGenreIds.filter(g => !genreIds.includes(g));
      const genresToAdd = genreIds.filter(g => !currentGenreIds.includes(g));

      // Remove old genres
      if (genresToRemove.length > 0) {
          await db.query('DELETE FROM movie_genre WHERE movie_id = ? AND genre_id IN (?)', [id, genresToRemove]);
      }

      console.log("genresToAdd",genresToAdd, "genresToRemove", genresToRemove,"genreIds",genreIds, "currentGenreIds",currentGenreIds)

      // Add new genres
      if (genresToAdd.length > 0) {
          const genreInsertValues = genresToAdd.map(genreId => [id, genreId]);
          await db.query('INSERT INTO movie_genre (movie_id, genre_id) VALUES ?', [genreInsertValues]);
      }

      // Update the movie in Elasticsearch
      await client.update({
        index: 'movies',
        id: id.toString(),
        body: {
          doc: {
            id, // This will store `id` as part of the document content in `_source`
            title,
            description,
            genre:genreString,
            image,
            release_date,
            vote_average,
            vote_count,
          }
        }
      });
  
      res.status(200).json({ success: true, message: 'Movie updated successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Failed to update movie' });
    }
  });
  


  // DELETE /movies/:id
router.delete('/movies/:id', async (req, res) => {
    const { id } = req.params;
  
    try {
      const [result] = await db.query('DELETE FROM movie WHERE id = ?', [id]);
  
      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: 'Movie not found' });
      }

      // Remove the movie from Elasticsearch
      await client.delete({
        index: 'movies',
        id: id.toString(),
      });
  
      res.status(200).json({ success: true, message: 'Movie deleted successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Failed to delete movie' });
    }
  });

  // Endpoint to get a list of genres
  router.get('/genres', async (req, res) => {
    try {
      const [genres] = await db.query('SELECT * FROM genre');
      res.status(200).json({ success: true, data: genres });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Failed to retrieve genres' });
    }
  });







  //Favorite movies
  router.post('/favorites', authenticateToken, async (req, res) => {
    const userId = req.user.id;
    const { movieId } = req.body;

    try {
        await db.query(
            'INSERT INTO favorite_movies (user_id, movie_id) VALUES (?, ?)',
            [userId, movieId]
        );
        res.status(200).json({ success: true, message: 'Movie added to favorites' });
    } catch (error) {
        console.error('Error adding movie to favorites:', error);
        res.status(500).json({ success: false, message: 'Failed to add movie to favorites' });
    }
  });

  router.delete('/favorites/:movieId', authenticateToken, async (req, res) => {
    const userId = req.user.id;
    const { movieId } = req.params;

    try {
        await db.query(
            'DELETE FROM favorite_movies WHERE user_id = ? AND movie_id = ?',
            [userId, movieId]
        );
        res.status(200).json({ success: true, message: 'Movie removed from favorites' });
    } catch (error) {
        console.error('Error removing movie from favorites:', error);
        res.status(500).json({ success: false, message: 'Failed to remove movie from favorites' });
    }
  });
  

  router.get('/favorites', authenticateToken, async (req, res) => {
    const userId = req.user.id;

    try {
        const [favorites] = await db.query(
            `SELECT movie.id, movie.title, movie.genre, movie.description, movie.image 
             FROM movie 
             JOIN favorite_movies ON movie.id = favorite_movies.movie_id 
             WHERE favorite_movies.user_id = ?
             ORDER BY favorite_movies.date_added DESC`,
            [userId]
        );
        res.status(200).json({ success: true, favorites });
    } catch (error) {
        console.error('Error fetching favorite movies:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch favorite movies' });
    }
  });















  async function getMoviesByGenres(pageSize = 10, pageNum = 1, genres = '', id) {
    try {
      // const connection = await pool.getConnection();
      pageSize = parseInt(pageSize, 10);
      pageNum = (parseInt(pageNum, 10));
      console.log("pageSize, pageNum, genres",pageSize, pageNum, genres)
      const offset = (pageNum - 1) * pageSize;  // Calculate offset for pagination
  
      if (genres) {
        const genreList = genres.split(",");
        const minMatchCount = Math.min(2, genreList.length);
  
        const genreConditions = genreList.map(() => `genre LIKE CONCAT('%', ?, '%')`).join(" OR ");
        const genreMatchCases = genreList.map(() => `CASE WHEN genre LIKE CONCAT('%', ?, '%') THEN 1 ELSE 0 END`).join(" + ");
        
        const genreQuery = `
          SELECT id, title, genre, release_date, vote_count, description, image, vote_average,
                 ( ${genreMatchCases} ) AS genre_match_count
          FROM movie
          WHERE (${genreConditions}) ${id?"AND id != ?":""} 
          GROUP BY id
          HAVING genre_match_count >= ?
          ORDER BY release_date DESC, vote_count DESC
          LIMIT ? OFFSET ?`;
        let movies;
          if(id){
          movies = await db.query(genreQuery, [...genreList, ...genreList, id, minMatchCount, pageSize, offset]);
        }else{
          movies = await db.query(genreQuery, [...genreList, ...genreList, minMatchCount, pageSize, offset]);
        }
        return movies[0];
      }
  
      // If no genres provided, return most recent and popular movies
      const recentMoviesQuery = `
          SELECT id, title, genre, release_date, vote_count, description, image, vote_average
          FROM movie
          ${id?"WHERE id != ?":""} 
          ORDER BY 
              CASE 
                  WHEN release_date > DATE_SUB(CURDATE(), INTERVAL 2 YEAR) THEN 1 
                  ELSE 0 
              END DESC, 
              vote_count DESC
          LIMIT ? OFFSET ?`;
      
      let recentPopularMovies;
      if(id){
        recentPopularMovies = await db.query(
          recentMoviesQuery, [id, pageSize, offset]
        );
      }else{
        recentPopularMovies = await db.query(
          recentMoviesQuery, [pageSize, offset]
        );
      }
      return recentPopularMovies[0];
  
    } catch (error) {
      console.error(error);
      throw error;
    }
  }


  


  async function getPersonalizedRecommendations(userId, pageNum = 1, pageSize = 10, unwantedGenres = '') {
    try {
        // Step 1: Get user's interaction history (visits + ratings)
        const [userVisits] = await db.query(
            'SELECT movie_id FROM user_history WHERE user_id = ?',
            [userId]
        );
        const [userRatings] = await db.query(
            'SELECT movie_id, rating FROM user_ratings WHERE user_id = ?',
            [userId]
        );
        // Step 2: Get user's favorite movies
        const [userFavorites] = await db.query(
          'SELECT movie_id FROM favorite_movies WHERE user_id = ?',
          [userId]
      );

        const interactionCount = userVisits.length + userRatings.length;
        const hasInteractions = interactionCount > 0;

        // Genre counts (with rating-weighted scores)
        const genreCounts = {};
        if (hasInteractions) {
            const movieInteractions = {};  // Store merged visit/rating interactions

            // Step 4: Process user visits with a visit weight
            const visitWeight = 5;
            for (const { movie_id } of userVisits) {
                if (!movieInteractions[movie_id]) {
                    movieInteractions[movie_id] = { type: 'visit', weight: visitWeight };
                }
            }

            // Step 5: Process user ratings, where ratings overwrite visits
            for (const { movie_id, rating } of userRatings) {
                let ratingWeight;
                if (rating > 5) {
                    ratingWeight = rating * Math.exp(rating * 0.1);  // Exponential growth for high ratings
                } else if (rating > 1) {
                    ratingWeight = rating * Math.log(rating ** 0.6);  // Logarithmic decay for low ratings
                } else {
                    ratingWeight = 0;  // Minimal influence for very low ratings
                }
                movieInteractions[movie_id] = { type: 'rating', weight: ratingWeight };  // Overwrite visit with rating
            }

             // Step 6: Process favorite movies, overwriting any existing weights with the max score
             const maxRatingWeight = 10 * Math.exp(10 * 0.1);  // Maximum score calculation
             for (const { movie_id } of userFavorites) {
                 movieInteractions[movie_id] = { type: 'favorite', weight: maxRatingWeight };  // Overwrite with max score
             }

            // Step 7: Apply calculated weights to genres for each movie interaction
            for (const movie_id in movieInteractions) {
                const interaction = movieInteractions[movie_id];
                const [movie] = await db.query('SELECT genre FROM movie WHERE id = ?', [movie_id]);
                const genres = movie[0].genre.split(',').map(g => g.trim());

                genres.forEach(genre => {
                    genreCounts[genre] = (genreCounts[genre] || 0) + interaction.weight;
                });
            }
        }

        console.log("genres recommendations:", genreCounts);

        // Convert genre weights to string for scoring
        const genreWeightsString = Object.keys(genreCounts)
            .map(genre => `${genre}:${Math.round(genreCounts[genre])}`)
            .join(',');

        // Step 7: Calculate offset for pagination
        const offset = (pageNum - 1) * pageSize;

        // Step 8: Fetch personalized recommendations based on calculated genre weights
        const moviesQuery = hasInteractions
            ? `SELECT id, title, genre, vote_count, release_date, description, image, vote_average,
                 calc_movie_score('${genreWeightsString}', genre, '${unwantedGenres}') AS score
               FROM movie
               ORDER BY score DESC
               LIMIT ? OFFSET ?`
            : `SELECT id, title, genre, vote_count, release_date, description, image, vote_average
               FROM movie
               LIMIT ? OFFSET ?`;//ORDER BY release_date DESC, vote_count DESC

        const [movies] = await db.query(moviesQuery, [pageSize, offset]);

        // Get the total number of movies for pagination
        const [totalMovies] = await db.query(`SELECT COUNT(*) AS count FROM movie`);
        const totalPages = Math.ceil(totalMovies[0].count / pageSize);

        // Return recommendations, totalPages, and currentPage
        return {
            recommendations: movies.map(movie => ({ ...movie, type: 'personalized' })),
            totalPages,
            currentPage: pageNum,
        };

    } catch (error) {
        console.error('Error generating recommendations:', error);
        throw error;
    }
}



  router.get('/recommendations/movie', async (req, res) => {
    const { genres = '', id ,page = 1, limit = 10 } = req.query;  // Extract query parameters
    
    try {
      // Call the getMoviesByGenres function with the parsed parameters
      const recommendations = await getMoviesByGenres(limit, page, genres, id);
      res.status(200).json({success: true, movies: recommendations}); // Return the movies in JSON format
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      res.status(500).json({ message: 'Failed to fetch recommendations' });
    }
  });



  // Endpoint for personalized recommendations
  router.get('/recommendations/personalized', authenticateToken, async (req, res) => {
    const userId = req.user.id;
    const { page = 1, limit = 10, unwantedGenres = '' } = req.query;

    try {
        const { recommendations, totalPages, currentPage } = await getPersonalizedRecommendations(
            userId,
            parseInt(page),
            parseInt(limit),
            unwantedGenres
        );
        res.status(200).json({ success: true, recommendations, totalPages, currentPage });
    } catch (error) {
        console.error('Error fetching personalized recommendations:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch recommendations' });
    }
  });





  router.get('/recommendations/user-genre-weights', authenticateToken, async (req, res) => {
    const userId = req.user.id;
  
    try {
      // Step 1: Get all genres from the genre table
      const [allGenres] = await db.query('SELECT name FROM genre');
  
      // Step 2: Get user's interaction history (visits + ratings)
      const [userVisits] = await db.query(
        'SELECT movie_id FROM user_history WHERE user_id = ?',
        [userId]
      );
      const [userRatings] = await db.query(
        'SELECT movie_id, rating FROM user_ratings WHERE user_id = ?',
        [userId]
      );
  
      // Initialize genre counts with all genres, set weights to 0
      const genreCounts = allGenres.reduce((acc, { name }) => {
        acc[name] = 0;
        return acc;
      }, {});
  
      // Step 3: Calculate weights for genres based on user interactions
      const visitWeight = 5;  // Adjust this weight as needed
      const movieInteractions = {};  // To store merged visit/rating interactions
  
      // Process user visits
      for (const { movie_id } of userVisits) {
        if (!movieInteractions[movie_id]) {
          movieInteractions[movie_id] = { type: 'visit', weight: visitWeight };
        }
      }
  
      // Process user ratings (ratings overwrite visits)
      for (const { movie_id, rating } of userRatings) {
        let ratingWeight;
        if (rating > 5) {
          ratingWeight = rating * Math.exp(rating * 0.1);
        } else if (rating > 1) {
          ratingWeight = rating * Math.log(rating ** 0.6);
        } else {
          ratingWeight = 0;
        }
        movieInteractions[movie_id] = { type: 'rating', weight: ratingWeight };
      }
  
      // Apply weights to genres for each movie interaction
      for (const movie_id in movieInteractions) {
        const interaction = movieInteractions[movie_id];
        const [movie] = await db.query('SELECT genre FROM movie WHERE id = ?', [movie_id]);
        const genres = movie[0].genre.split(',').map((g) => g.trim());
  
        genres.forEach((genre) => {
          genreCounts[genre] += interaction.weight;
        });
      }

      // Step 4: Sort genres by weight in descending order
      const sortedGenreWeights = Object.entries(genreCounts)
      .sort(([, weightA], [, weightB]) => weightB - weightA)
      .map(([genre, weight]) => ({ genre, weight }));
  
      res.status(200).json({ success: true, genreWeights: sortedGenreWeights });
    } catch (error) {
      console.error('Error fetching user genre weights:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch genre weights' });
    }
  });




module.exports = router;
  




















// async function getPersonalizedRecommendations(userId, pageNum = 1, pageSize = 10, lambda = 0.05, visitWeight = 5, unwantedGenres = '') {
  //   try {
  //     // Step 1: Get user's interaction history (visits + ratings)
  //     const [userVisits] = await db.query(
  //       'SELECT movie_id FROM user_history WHERE user_id = ?',
  //       [userId]
  //     );
  //     const [userRatings] = await db.query(
  //       'SELECT movie_id, rating FROM user_ratings WHERE user_id = ?',
  //       [userId]
  //     );
  
  //     const interactionCount = userVisits.length + userRatings.length;
  
  //     // Step 2: If no interactions, return popular movies
  //     if (interactionCount === 0) {
  //       // const movies = await getMoviesByGenres(pageSize, pageNum);
  //       // const [totalMovies] = await db.query('SELECT COUNT(id) AS count FROM movie');
  //       // const totalPages = Math.ceil(totalMovies[0].count / pageSize);
  //       // return { recommendations: movies, totalPages, currentPage: pageNum };
  //       return await getMoviesByGenres(pageSize, pageNum); // Fallback to popular movies with pagination
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
  //       const [movie] = await db.query('SELECT genre FROM movie WHERE id = ?', [movie_id]);
  //       const genres = movie[0].genre.split(',').map(g => g.trim());
  
  //       genres.forEach(genre => {
  //         genreCounts[genre] = (genreCounts[genre] || 0) + interaction.weight;
  //       });
  //     }
  
  //     console.log("genres reccomendations:", genreCounts)
  
  //     // Step 7: Convert user's genre weights to string format
  //     const genreWeightsString = Object.keys(genreCounts)
  //       .map(genre => `${genre}:${Math.round(genreCounts[genre])}`)
  //       .join(',');
  
  //     // Calculate offset for pagination
  //     const offset = (pageNum - 1) * Math.ceil(pageSize );//* P_personalized
  
  //     // Step 8: Get personalized movie recommendations based on genre preferences
  //     const personalizedRecommendations = await db.query(
  //       `SELECT id, title, genre, vote_count, release_date, description, image, vote_average,
  //           calc_movie_score('${genreWeightsString}', genre, '${unwantedGenres}') AS score
  //        FROM movie 
  //        WHERE id NOT IN (SELECT movie_id FROM user_history WHERE user_id = ?)  
  //        ORDER BY score DESC 
  //        LIMIT ? OFFSET ?`,
  //       [userId, pageSize , offset]//Math.ceil(pageSize * P_personalized)
  //     );
  //     console.log("len of presonilized", Math.ceil(pageSize * P_personalized), personalizedRecommendations[0].length)
  //     personalizedRecommendations[0].forEach(movie => {
  //       console.log(`Personalized: Movie ID: ${movie.id}, Title: ${movie.title}, Genres:${movie.genre}, Score: ${Math.round(movie.score)}`);
  //     });
  
      
  //     // const popularRecommendations = await getMoviesByGenres(Math.floor(pageSize * P_popular), pageNum);
  //     // console.log("len of 'popular':", Math.floor(pageSize * P_popular), popularRecommendations.length)
  //     // popularRecommendations.forEach(movie => {
  //     //   console.log(`popular: Movie ID: ${movie.id}, Title: ${movie.title}, release_date:${movie.release_date}, vote_count:${movie.vote_count} `);
  //     // });
  
  //     // Combine personalized and popular recommendations
  //     const recommendations = [
  //       ...personalizedRecommendations[0].map(movie => ({ ...movie, type: 'personalized' })),
  //       // ...popularRecommendations.map(movie => ({ ...movie, type: 'popular' }))
  //     ];
  
  //     return recommendations;
  
  //   } catch (error) {
  //     console.error('Error generating recommendations:', error);
  //     throw error;
  //   } 
  // }