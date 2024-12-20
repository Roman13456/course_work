drop database movies;
create database movies;
use movies;

# drop  table  user_ratings;
# drop table user_history;
# drop table user;




CREATE TABLE `user` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,  -- Auto-incrementing primary key
    `email` VARCHAR(255) NOT NULL UNIQUE,
    `password` VARCHAR(255) NOT NULL,
    `admin` BOOLEAN DEFAULT FALSE,  -- Whether the user is an admin or not
    `resetToken` VARCHAR(255),      -- For password reset purposes
    `resetTokenExpiresAt` DATETIME  -- Expiry time of reset token
);

CREATE TABLE `refresh_tokens` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,  -- Reference to the user
    `token` VARCHAR(255) NOT NULL,  -- The refresh token
    `expires_at` DATETIME NOT NULL,  -- Expiration date and time for the token
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `revoked` BOOLEAN DEFAULT FALSE,  -- Whether the token is revoked
    FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE
);


CREATE TABLE `newuser` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `email` VARCHAR(255) NOT NULL UNIQUE,
    `password` VARCHAR(255) NOT NULL,
    `confirmation_token` VARCHAR(255) NOT NULL,  -- Token to confirm the registration
    `token_expires_at` DATETIME NOT NULL,  -- Expiry date for the confirmation token
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE `genre` (
    `id` INT PRIMARY KEY,  -- Auto-incrementing genre ID
    `name` VARCHAR(255) NOT NULL UNIQUE   -- Name of the genre (e.g., Action, Horror)
);

CREATE TABLE `movie` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,     -- Auto-incrementing movie ID
    `title` VARCHAR(255) NOT NULL,           -- Movie title
    `description` TEXT NOT NULL,             -- Description or plot of the movie
    `genre` VARCHAR(255),                    -- Genres stored as a comma-separated string (e.g., "Action,Comedy")
    `image` VARCHAR(255),                    -- URL link to the movie poster
    `release_date` DATE,                     -- Release date of the movie
    `vote_average` DECIMAL(10, 8),        -- Average vote rating
    `vote_count` INT                         -- Number of votes
);


CREATE TABLE `movie_genre` (
    `movie_id` INT,                         -- Foreign key to `movie.id`
    `genre_id` INT,                         -- Foreign key to `genre.id`
    PRIMARY KEY (`movie_id`, `genre_id`),
    FOREIGN KEY (`movie_id`) REFERENCES `movie`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`genre_id`) REFERENCES `genre`(`id`) ON DELETE CASCADE
);



CREATE TABLE `user_history` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT,                  -- Foreign key to `user._id`
    `movie_id` INT,                         -- Foreign key to `movie.id`
    FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`movie_id`) REFERENCES `movie`(`id`) ON DELETE CASCADE
);

CREATE TABLE `user_ratings` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,      -- Auto-incrementing rating ID
    `user_id` INT,                    -- Foreign key to `user._id`
    `movie_id` INT,                           -- Foreign key to `movie.id`
    `rating` TINYINT CHECK (`rating` BETWEEN 1 AND 10), -- Rating from 1 to 10
    FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`movie_id`) REFERENCES `movie`(`id`) ON DELETE CASCADE
);

CREATE TABLE `favorite_movies` (
    `user_id` INT NOT NULL,        -- ID of the user
    `movie_id` INT NOT NULL,       -- ID of the movie
    `date_added` DATETIME DEFAULT CURRENT_TIMESTAMP,  -- Date when the movie was added
    PRIMARY KEY (`user_id`, `movie_id`),
    FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`movie_id`) REFERENCES `movie`(`id`) ON DELETE CASCADE
);






