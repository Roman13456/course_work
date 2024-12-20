const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');  // To generate unique refresh tokens
const db = require('../config/db');  // Import the MySQL pool
require('dotenv').config();  // Load .env file
const JWT_SECRET = 'your_jwt_secret_here';
const Decimal = require('decimal.js');
// const JWT_REFRESH_SECRET = 'your_refresh_secret_here';

// Register a new user


// router.post('/register', async (req, res) => {
//   const { email, password } = req.body;

//   if (!email || !password) {
//     return res.status(400).json({ success: false, message: 'Email and password are required' });
//   }

//   try {
//     // Check if user already exists
//     const [existingUser] = await db.query('SELECT * FROM user WHERE email = ?', [email]);
//     if (existingUser.length > 0) {
//       return res.status(400).json({ success: false, message: 'Email is already registered' });
//     }

//     // Hash the password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // Insert the new user into the database
//     const [result] = await db.query('INSERT INTO user (email, password) VALUES (?, ?)', [email, hashedPassword]);

//     // Generate a JWT token
//     const token = jwt.sign({ id: result.insertId, email }, JWT_SECRET, { expiresIn: '7d' });

//     // Respond with the user data and token
//     res.status(201).json({
//       success: true,
//       user: {
//         id: result.insertId,
//         email
//       },
//       token
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, message: 'Server error' });
//   }
// });

// src/routes/auth.js


const sendGridMail = require('@sendgrid/mail');  // Import SendGrid
sendGridMail.setApiKey(process.env.SENDGRID_API_KEY);  // Set SendGrid API key
const crypto = require('crypto');  // For generating the confirmation token
const { error } = require('console');

// Register a new user and send confirmation email
router.post('/register', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required' });
  }

  try {
    // Check if the user already exists in either user or newuser table
    const [existingUser] = await db.query('SELECT * FROM user WHERE email = ? UNION SELECT * FROM newuser WHERE email = ?', [email, email]);
    if (existingUser.length > 0) {
      return res.status(400).json({ success: false,errors:{
        email: "Email is already in use or pending confirmation",
      }, message: 'Email is already registered or pending confirmation' });
    }


    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate a confirmation token
    const confirmationToken = crypto.randomBytes(32).toString('hex');
    const tokenExpiration = new Date();
    tokenExpiration.setHours(tokenExpiration.getHours() + 1);  // Token expires in 1 hour

    // Insert user data into the newuser table
    await db.query('INSERT INTO newuser (email, password, confirmation_token, token_expires_at) VALUES (?, ?, ?, ?)', 
                   [email, hashedPassword, confirmationToken, tokenExpiration]);

    // Send the confirmation email
    const confirmationLink = `${process.env.APP_PAGE}/email-confirmed/${confirmationToken}`;
    const msg = {
      to: email,
      from: 'romankhromishin@gmail.com',
      subject: 'Confirm your registration',
      text: `Please confirm your registration by clicking on the following link: ${confirmationLink}`,
      html: `<strong>Please confirm your registration by clicking on the following link: <a href="${confirmationLink}">${confirmationLink}</a></strong>`,
    };
    await sendGridMail.send(msg);

    // Respond with success
    res.status(200).json({ success: true, message: 'Confirmation email sent. Please check your inbox.' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});


// Confirm the user's registration
router.post('/email-confirmed/:token', async (req, res) => {
  const { token } = req.params;

  try {
    // Look up the user in the newuser table by the confirmation token
    const [unconfirmedUser] = await db.query('SELECT * FROM newuser WHERE confirmation_token = ?', [token]);

    if (unconfirmedUser.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid or expired token' });
    }

    const user = unconfirmedUser[0];

    // Check if the token has expired
    const currentTime = new Date();
    if (new Date(user.token_expires_at) < currentTime) {
      return res.status(400).json({ success: false, message: 'Token has expired' });
    }

    // Move the user from newuser to the user table
    await db.query('INSERT INTO user (email, password) VALUES (?, ?)', [user.email, user.password]);

    // Delete the user from the newuser table
    await db.query('DELETE FROM newuser WHERE id = ?', [user.id]);
    console.log("Registration confirmed! You can now log in")

    res.status(200).json({ success: true, message: 'Registration confirmed! You can now log in.' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Endpoint to handle password reset request 
router.post('/request-password-reset', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required' });
  }

  try {
    // Check if user exists
    const [user] = await db.query('SELECT * FROM user WHERE email = ?', [email]);

    if (user.length === 0) {
      return res.status(400).json({ success: false, errors:{
        email:"No account found with that email address"
      }, message: 'Email not found' });
    }

    const userData = user[0];

    // Generate a reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiresAt = new Date();
    resetTokenExpiresAt.setHours(resetTokenExpiresAt.getHours() + 1);  // Token expires in 1 hour

    // Store the reset token and expiration in the database
    await db.query('UPDATE user SET resetToken = ?, resetTokenExpiresAt = ? WHERE id = ?', [resetToken, resetTokenExpiresAt, userData.id]);

    // Generate the password reset link
    const resetLink = `${process.env.APP_PAGE}/reset-password/${resetToken}`;
    
    // Send the email using SendGrid
    const msg = {
      to: email,
      from: 'romankhromishin@gmail.com',  // Change to your verified SendGrid email
      subject: 'Password Reset Request',
      text: `You requested a password reset. Click the link to reset your password: ${resetLink}`,
      html: `<strong>Click the link to reset your password: <a href="${resetLink}">${resetLink}</a></strong>`,
    };

    await sendGridMail.send(msg);

    // Respond to the client
    res.status(200).json({ success: true, message: 'Password reset email sent' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});



// Endpoint to handle password reset itself
router.post('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({ success: false, message: 'Token and new password are required' });
  }

  try {
    // Look up the user by the reset token
    const [user] = await db.query('SELECT * FROM user WHERE resetToken = ?', [token]);

    if (user.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid or expired token' });
    }

    const userData = user[0];

    // Check if the token has expired
    const currentTime = new Date();
    if (new Date(userData.resetTokenExpiresAt) < currentTime) {
      return res.status(400).json({ success: false, message: 'Token has expired' });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password and clear the reset token fields
    await db.query('UPDATE user SET password = ?, resetToken = NULL, resetTokenExpiresAt = NULL WHERE id = ?', [hashedPassword, userData.id]);

    res.status(200).json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});


// src/routes/auth.js

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required'});
  }

  try {
    // Check if user exists
    const [existingUser] = await db.query('SELECT * FROM user WHERE email = ?', [email]);

    if (existingUser.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid email or password' ,errors:{
        email: "Entered email doesn't exist",
      }});
    }

    const user = existingUser[0];

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ success: false, message: 'Invalid email or password', errors:{
        password: "Password is incorrect",
      }});
    }

    // Generate access token (short-lived)
    console.log('signed user with',JWT_SECRET)
    const accessToken = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '15m' });
    console.log("signed token",accessToken)


    
    // Generate refresh token (long-lived) and store in the database
    const refreshToken = uuidv4();  // A unique string for the refresh token
    const refreshTokenExpiration = new Date();
    refreshTokenExpiration.setDate(refreshTokenExpiration.getDate() + 7);  // Set expiration to 7 days from now

    await db.query('INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)', [user.id, refreshToken, refreshTokenExpiration]);

    // Set the refresh token as an HTTP-only, secure cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',  // Only send over HTTPS
      expires: refreshTokenExpiration,
      sameSite: 'Strict',  // To protect against CSRF
    });
    
    // Send the access token to the client
    res.status(200).json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        admin: user.admin
      },
      message: 'Successfully logged in',
      accessToken,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});






router.post('/refresh-token', async (req, res) => {
  try {
    console.log(req.cookies)
    const refreshToken = req.cookies.refreshToken;  // Read the refresh token from the httpOnly cookie
    
    if (!refreshToken) {
      return res.status(400).json({ success: false, message: 'Refresh token is missing' });
    }

    // Verify the refresh token in the database
    const [storedToken] = await db.query('SELECT * FROM refresh_tokens WHERE token = ?', [refreshToken]);

    if (storedToken.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid refresh token' });
    }

    const tokenData = storedToken[0];

    // Check if the refresh token is expired
    const currentTime = new Date();
    if (new Date(tokenData.expires_at) < currentTime) {
      return res.status(401).json({ success: false, message: 'Refresh token has expired' });
    }
    console.log("long time token",new Date(tokenData.expires_at))

    // Generate a new access token
    const newAccessToken = jwt.sign({ id: tokenData.user_id }, JWT_SECRET, { expiresIn: '15m' });

    res.status(200).json({
      success: true,
      message: "Token successfully refreshed",
      accessToken: newAccessToken
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});





// Logout route (delete refresh token)
router.post('/logout', async (req, res) => {
  console.log(req.cookies)
  const refreshToken = req.cookies.refreshToken;  // Access refresh token from httpOnly cookie
  
  if (!refreshToken) {
    return res.status(400).json({ success: false, message: 'Refresh token is required' });
  }

  try {
    // Delete the refresh token from the database
    await db.query('DELETE FROM refresh_tokens WHERE token = ?', [refreshToken]);
    
    // Clear the refresh token cookie
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',  // Make sure it's only sent over HTTPS
      sameSite: 'Strict',
    });
    
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});



const authenticateToken = (req, res, next) => {
  // console.log("headers",req.headers)
  const authHeader = req.headers['authorization'];

  const token = authHeader && authHeader.split(' ')[1];  // Extract the token from "Bearer <token>"
  
  if (!token) {
    return res.status(401).json({success: false, message: 'Access token required' });
  }

  // Verify the token
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      // Check if the error is due to token expiration
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({success: false, message: 'Access token expired' });  // Token expired, return 401
      }
      return res.status(403).json({success: false, message: 'Invalid token' });  // Other token errors, return 403
    }
    
    req.user = user;  // Store the user info in the request object
    next();
  });
};


// Route to fetch the user profile (protected route)
router.get('/user/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;  // Get user ID from the decoded JWT token

    // Fetch user details from the database
    const [user] = await db.query('SELECT id, email, admin FROM user WHERE id = ?', [userId]);
    
    if (!user) {
      return res.status(404).json({success: false, message: 'User not found' });
    }
    console.log("user",user)
    res.json({user: user[0],success: true, message: "User successfully fetched"}  );  // Send the user data
  } catch (error) {
    console.error(error);
    res.status(500).json({success: false, message: 'Server error' });
  }
});


// Route to submit a movie rating (protected by token)
// router.post('/rate-movie', authenticateToken, async (req, res) => {
//   const { movieId, rating } = req.body;

//   if (!movieId || !rating || rating < 1 || rating > 10) {
//     return res.status(400).json({ success: false, message: 'Invalid data' });
//   }

//   try {
//     // Check if the user has already rated the movie
//     const [existingRating] = await db.query(
//       'SELECT * FROM user_ratings WHERE user_id = ? AND movie_id = ?',
//       [req.user.id, movieId]  // Use user ID from the token
//     );

//     if (existingRating.length > 0) {
//       // Update existing rating
//       await db.query(
//         'UPDATE user_ratings SET rating = ? WHERE user_id = ? AND movie_id = ?',
//         [rating, req.user.id, movieId]
//       );
//     } else {
//       // Insert new rating
//       console.log("usertest: ", req.user)

//       await db.query(
//         'INSERT INTO user_ratings (user_id, movie_id, rating) VALUES (?, ?, ?)',
//         [req.user.id, movieId, rating]
//       );
//     }

//     res.status(200).json({ success: true, message: 'Rating submitted successfully' });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, message: 'Server error' });
//   }
// });

router.post('/rate-movie', authenticateToken, async (req, res) => {
  const { movieId, rating } = req.body;

  if (!movieId || !rating || rating < 1 || rating > 10) {
    return res.status(400).json({ success: false, message: 'Invalid data' });
  }

  try {
    // Fetch the current movie details for calculations
    const [movie] = await db.query('SELECT vote_average, vote_count FROM movie WHERE id = ?', [movieId]);

    if (movie.length === 0) {
      return res.status(404).json({ success: false, message: 'Movie not found' });
    }

    let vote_average = new Decimal(movie[0].vote_average);
    let vote_count = new Decimal(movie[0].vote_count);
    let newVoteAverage;
    
    // Check if the user has already rated the movie
    const [existingRating] = await db.query(
      'SELECT * FROM user_ratings WHERE user_id = ? AND movie_id = ?',
      [req.user.id, movieId]  // Use user ID from the token
    );

    const newRating = new Decimal(rating);

    if (existingRating.length > 0) {
      // The user is rerating the movie
      const oldRating = new Decimal(existingRating[0].rating); 

      newVoteAverage = vote_average
          .times(vote_count)
          .minus(oldRating)
          .plus(newRating)
          .dividedBy(vote_count);

      // Update the user's rating
      await db.query(
        'UPDATE user_ratings SET rating = ? WHERE user_id = ? AND movie_id = ?',
        [newRating.toFixed(0), req.user.id, movieId]
      );
    } else {
      // The user is rating the movie for the first time
      // newVoteAverage = (vote_average * vote_count + rating) / (vote_count + 1);
      newVoteAverage = vote_average
        .times(vote_count)
        .plus(newRating)
        .dividedBy(vote_count.plus(1));
      
      // Insert new rating
      await db.query(
        'INSERT INTO user_ratings (user_id, movie_id, rating) VALUES (?, ?, ?)',
        [req.user.id, movieId, newRating.toFixed(1)]
      );

      // Increment vote count
      vote_count = vote_count.plus(1);
    }

    // Update the movie with the new vote average and vote count
    await db.query(
      'UPDATE movie SET vote_average = ?, vote_count = ? WHERE id = ?',
      [newVoteAverage.toFixed(8), vote_count.toFixed(0), movieId]  // Save with more precision
    );

    res.status(200).json({ success: true, message: 'Rating submitted successfully', updatedRating:{rating, movie_id: movieId}});
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});


router.get('/user-rating/:movieId', authenticateToken, async (req, res) => {
  const { movieId } = req.params;

  try {
    // Fetch the user's rating for the specific movie
    const [userRating] = await db.query(
      'SELECT movie_id, rating FROM user_ratings WHERE user_id = ? AND movie_id = ?',
      [req.user.id, movieId]
    );

    if (userRating.length === 0) {
      return res.status(404).json({ success: false, message: 'No rating found for this movie' });
    }

    res.status(200).json({ success: true, rating: userRating[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});



// Endpoint to add a movie visit to the user history
// Endpoint to add a movie visit to the user history with authentication
router.post('/history/add', authenticateToken, async (req, res) => {
  const { movie_id } = req.body; // Expecting `movie_id` in request body
  const user_id = req.user.id;   // `user_id` is retrieved from the decoded token
  console.log(movie_id)

  try {
    // Step 1: Check if the record already exists
    const [existingRecord] = await db.query(
      'SELECT * FROM user_history WHERE user_id = ? AND movie_id = ?',
      [user_id, movie_id]
    );

    // Step 2: If a record already exists, do nothing
    if (existingRecord.length > 0) {
      return res.status(200).json({ message: 'Record already exists' });
    }

    // Step 3: If no record exists, insert the new entry
    await db.query(
      'INSERT INTO user_history (user_id, movie_id) VALUES (?, ?)',
      [user_id, movie_id]
    );

    // Step 4: Return a success message
    res.status(201).json({ message: 'History entry added successfully' });

  } catch (error) {
    console.error('Error adding to user history:', error);
    res.status(500).json({ error: 'Failed to add to user history' });
  }
});

  
  
module.exports = {
  authenticateToken,
  router,
};