


import requests
import mysql.connector
import time

# TMDB API key
API_KEY = '0abb120c47464e3c980d0ec1b30905ee'

# Database connection
try:
    db_config = {
        'host': 'localhost',
        'user': 'root',
        'password': 'root'
    }

    db = mysql.connector.connect(**db_config)
    cursor = db.cursor()
    print("Database connection successful")
except mysql.connector.Error as err:
    print(f"Error: {err}")
    exit(1)  # Exit script if DB connection fails


# Function to create database and tables
def create_database_and_tables():
    # SQL script to create database and all tables
    CREATE_DB_AND_TABLES = [
        "CREATE DATABASE IF NOT EXISTS movies;",
        "USE movies;",

        # Drop tables if needed
        "DROP TABLE IF EXISTS user_ratings, user_history, favorite_movies, movie_genre, movie, genre, refresh_tokens, newuser, `user`;", 

        # Create user table
        """
        CREATE TABLE `user` (
            `id` INT AUTO_INCREMENT PRIMARY KEY,
            `email` VARCHAR(255) NOT NULL UNIQUE,
            `password` VARCHAR(255) NOT NULL,
            `admin` BOOLEAN DEFAULT FALSE,
            `resetToken` VARCHAR(255),
            `resetTokenExpiresAt` DATETIME
        );
        """,

        # Create refresh_tokens table
        """
        CREATE TABLE `refresh_tokens` (
            `id` INT AUTO_INCREMENT PRIMARY KEY,
            `user_id` INT NOT NULL,
            `token` VARCHAR(255) NOT NULL,
            `expires_at` DATETIME NOT NULL,
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            `revoked` BOOLEAN DEFAULT FALSE,
            FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE
        );
        """,

        # Create newuser table
        """
        CREATE TABLE `newuser` (
            `id` INT AUTO_INCREMENT PRIMARY KEY,
            `email` VARCHAR(255) NOT NULL UNIQUE,
            `password` VARCHAR(255) NOT NULL,
            `confirmation_token` VARCHAR(255) NOT NULL,
            `token_expires_at` DATETIME NOT NULL,
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """,

        # Create genre table
        """
        CREATE TABLE `genre` (
            `id` INT PRIMARY KEY,
            `name` VARCHAR(255) NOT NULL UNIQUE
        );
        """,

        # Create movie table
        """
        CREATE TABLE `movie` (
            `id` INT AUTO_INCREMENT PRIMARY KEY,
            `title` VARCHAR(255) NOT NULL,
            `description` TEXT NOT NULL,
            `genre` VARCHAR(255),
            `image` VARCHAR(255),
            `release_date` DATE,
            `vote_average` DECIMAL(10, 8),
            `vote_count` INT
        );
        """,

        # Create movie_genre table
        """
        CREATE TABLE `movie_genre` (
            `movie_id` INT,
            `genre_id` INT,
            PRIMARY KEY (`movie_id`, `genre_id`),
            FOREIGN KEY (`movie_id`) REFERENCES `movie`(`id`) ON DELETE CASCADE,
            FOREIGN KEY (`genre_id`) REFERENCES `genre`(`id`) ON DELETE CASCADE
        );
        """,

        # Create user_history table
        """
        CREATE TABLE `user_history` (
            `id` INT AUTO_INCREMENT PRIMARY KEY,
            `user_id` INT,
            `movie_id` INT,
            FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE,
            FOREIGN KEY (`movie_id`) REFERENCES `movie`(`id`) ON DELETE CASCADE
        );
        """,

        # Create user_ratings table
        """
        CREATE TABLE `user_ratings` (
            `id` INT AUTO_INCREMENT PRIMARY KEY,
            `user_id` INT,
            `movie_id` INT,
            `rating` TINYINT CHECK (`rating` BETWEEN 1 AND 10),
            FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE,
            FOREIGN KEY (`movie_id`) REFERENCES `movie`(`id`) ON DELETE CASCADE
        );
        """,

        # Create favorite_movies table
        """
        CREATE TABLE `favorite_movies` (
            `user_id` INT NOT NULL,
            `movie_id` INT NOT NULL,
            `date_added` DATETIME DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (`user_id`, `movie_id`),
            FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE,
            FOREIGN KEY (`movie_id`) REFERENCES `movie`(`id`) ON DELETE CASCADE
        );
        """
    ]

    # Execute each SQL command
    for query in CREATE_DB_AND_TABLES:
        try:
            cursor.execute(query)
        except mysql.connector.Error as err:
            print(f"Error: {err}")
    print("Database and tables created successfully.")

# Call function to create database and tables
create_database_and_tables()

moviesInsertedCounter = 0

# Function to insert genres into the `genre` table
def insert_genres(genres):
    for genre in genres:
        cursor.execute("""
            INSERT INTO genre (id, name)
            VALUES (%s, %s)
            ON DUPLICATE KEY UPDATE name = VALUES(name)
        """, (genre['id'], genre['name']))
    db.commit()


def get_genre_names(genre_ids):
    """Fetch genre names corresponding to genre_ids from the genre table."""
    genre_names = []
    for genre_id in genre_ids:
        cursor.execute("SELECT name FROM genre WHERE id = %s", (genre_id,))
        genre_name = cursor.fetchone()
        if genre_name:
            genre_names.append(genre_name[0])
    return genre_names

def insert_movie(movie, genre_ids):
    global moviesInsertedCounter  # Declare the global variable
    # Skip movies without a release date or with a vote count less than 800
    if not movie['release_date'] or movie['vote_count'] < 800:
        # print(f"Skipping movie '{movie['title']}' due to missing release date or insufficient vote count.")
        return

    # Get the genre names from the genre_ids
    genre_names = get_genre_names(genre_ids)
    genres_string = ','.join(genre_names)  # Create a comma-separated string of genre names

    # Insert into movie table
    
    cursor.execute("""
        INSERT INTO movie (title, description, genre, image, release_date, vote_average, vote_count) 
        VALUES (%s, %s, %s, %s, %s, %s, %s)
    """, (
        movie['title'],
        movie['overview'],
        genres_string,  # Insert the comma-separated genre names string here
        movie['poster_path'],
        movie['release_date'],  # Insert release date directly
        movie['vote_average'],
        movie['vote_count']
    ))
    movie_id = cursor.lastrowid

    # Insert into movie_genre table (junction table)
    for genre_id in genre_ids:
        cursor.execute("""
            INSERT INTO movie_genre (movie_id, genre_id) 
            VALUES (%s, %s)
        """, (movie_id, genre_id))

    db.commit()
    # Increment the global counter
    moviesInsertedCounter += 1




# Function to fetch genres from TMDB and populate the genres table
def fetch_and_insert_genres():
    url = f"https://api.themoviedb.org/3/genre/movie/list?api_key={API_KEY}&language=en-US"
    response = requests.get(url)
    data = response.json()
    genres = data.get('genres', [])
    insert_genres(genres)
    print("Genres inserted")

#
# Function to fetch movies based on genres and insert them into the movies table
def fetch_and_insert_movies(page=1):
    url = f"https://api.themoviedb.org/3/discover/movie?api_key={API_KEY}&language=en-US&sort_by=popularity.desc&page={page}"
    response = requests.get(url)
    data = response.json()
    movies = data.get('results', [])
    counter = 0
    for movie in movies:
        counter += 1
        genre_ids = movie.get('genre_ids', [])
        insert_movie(movie, genre_ids)
    # print("movie count is", counter)


# Pull genres into the genres table
fetch_and_insert_genres()

# Fetch and insert at least 1000 movies from different pages
print("Inserting movies ...")
pages_to_fetch = 50  # Each page contains 20 movies, so 50 pages would give 1000 movies
for page in range(1, pages_to_fetch + 1):
    fetch_and_insert_movies(page)
    time.sleep(1)  # Respect TMDB's rate limiting

print(moviesInsertedCounter, " movies inserted to db")

