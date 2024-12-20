// src/store/thunks/moviesThunks.js
import { createAsyncThunk } from '@reduxjs/toolkit';
import moviesApi from '../../api/moviesApi';

// if (error.response) {
//   return rejectWithValue(error.response.data);  // Return error from server
// } else if (error.request) {
//   return rejectWithValue({message:'No response from the server. Please try again later.'});
// } else {
//   return rejectWithValue({message:'An error occurred. Please try again.'});
// }


// Thunk to fetch a specific movie by ID
export const fetchMovieByIdThunk = createAsyncThunk(
  'movies/fetchMovieById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await moviesApi.getMovieById(id);  // Add this API call in your API file
      return response.data;
    } catch (error) {
      if (error.response) {
        return rejectWithValue(error.response.data);  // Return error from server
      } else if (error.request) {
        return rejectWithValue({message:'No response from the server. Please try again later.'});
      } else {
        return rejectWithValue({message:'An error occurred. Please try again.'});
      }
    }
  }
);




// Thunk to fetch movies with pagination
export const fetchMoviesThunk = createAsyncThunk(
  
  'movies/fetchMovies',
  async ({ page, limit, sortParameter, sortOrder, query,  genre}, { rejectWithValue }) => {
    try {
      // Choose the correct API endpoint based on the presence of a search query
      const response = query
        ? await moviesApi.searchMovies(page, limit, query, sortParameter, sortOrder)
        : await moviesApi.getMovies(page, limit, sortParameter, sortOrder, genre);

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response ? error.response.data.message : error.message);
    }
  }
);


// Thunk to fetch movies with pagination
export const fetchMovieReccomendations = createAsyncThunk(
  'movies/fetchMovieReccomendations',
  async ({genres, id}, { rejectWithValue }) => {
    try {
      // Choose the correct API endpoint based on the presence of a search query
      const response = await moviesApi.getReccomendationsMovie(genres, id);
      return response.data;
    } catch (error) {
      if (error.response) {
        return rejectWithValue(error.response.data);  // Return error from server
      } else if (error.request) {
        return rejectWithValue({message:'No response from the server. Please try again later.'});
      } else {
        return rejectWithValue({message:'An error occurred. Please try again.'});
      } 
    }
  }
);

// Thunk to add a new movie
export const addMovieThunk = createAsyncThunk(
  'movies/addMovie',
  async (movieData, { rejectWithValue }) => {
    try {
      const response = await moviesApi.addMovie(movieData);
      return response.data;  // Assuming the API returns the newly added movie in response.data
    } catch (error) {
      if (error.response) {
        return rejectWithValue(error.response.data);  // Return error from server
      } else if (error.request) {
        return rejectWithValue({message:'No response from the server. Please try again later.'});
      } else {
        return rejectWithValue({message:'An error occurred. Please try again.'});
      }
    }
  }
);

// Thunk to update a movie by its ID
export const updateMovieThunk = createAsyncThunk(
  'movies/updateMovie',
  async (movieData, { rejectWithValue }) => {
    try {
      const response = await moviesApi.updateMovie(movieData);
      return response.data;  // Assuming the API returns the updated movie in response.data
    } catch (error) {
      if (error.response) {
        return rejectWithValue(error.response.data);  // Return error from server
      } else if (error.request) {
        return rejectWithValue({message:'No response from the server. Please try again later.'});
      } else {
        return rejectWithValue({message:'An error occurred. Please try again.'});
      }  
    }
  }
);

// Thunk to delete a movie by its ID
export const deleteMovieThunk = createAsyncThunk(
  'movies/deleteMovie',
  async (movieId, { rejectWithValue }) => {
    try {
      await moviesApi.deleteMovie(movieId);
      return movieId;  // Return the deleted movie ID so we can remove it from the state
    } catch (error) {
      if (error.response) {
        return rejectWithValue(error.response.data);  // Return error from server
      } else if (error.request) {
        return rejectWithValue({message:'No response from the server. Please try again later.'});
      } else {
        return rejectWithValue({message:'An error occurred. Please try again.'});
      }
    }
  }
);

