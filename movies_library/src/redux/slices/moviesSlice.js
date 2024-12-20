// src/store/slices/moviesSlice.js
import { createSlice } from '@reduxjs/toolkit';
import { fetchMoviesThunk, fetchMovieByIdThunk, addMovieThunk, updateMovieThunk, deleteMovieThunk, fetchMovieReccomendations } from '../thunks/moviesThunks';

const moviesSlice = createSlice({
  name: 'movies',
  initialState: {
    list: [],  // The array of movies
    totalPages: 0,
    currentPage: 0,
    loading: false,
    //sort
    totalResults: null,
    parameter: null,
    order: null,
    movie: null,
    noConnection: false,
    error: null
  },
  reducers: {
    resetMovieDetails: (state) => {
      state.movie = null;
    }

  },
  extraReducers: (builder) => {
    builder
      // Handle fetch movies
      .addCase(fetchMoviesThunk.pending, (state, action) => {
        state.loading = true;
        state.error = null;
        if(action.payload){
          if(action.payload.parameter){
            state.parameter = action.payload.parameter
            if(action.payload.order){
              state.order = action.payload.order
            }
          }
        }
      })
      .addCase(fetchMoviesThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.movies;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.currentPage;
        state.totalResults = action.payload.total;
      })
      .addCase(fetchMoviesThunk.rejected, (state, action) => {
        state.loading = false;
        console.log(action.payload)
        state.error = action.payload;
      })
      
      // Handle add movie
      .addCase(addMovieThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addMovieThunk.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(addMovieThunk.rejected, (state, action) => {
        state.loading = false;
        if(!("success" in action.payload)){
          state.noConnection = true;
        }
        state.error = action.payload.message;
      })
      
      // Handle update movie
      .addCase(updateMovieThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateMovieThunk.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.list.findIndex(movie => movie.id === action.payload.id);
        if (index !== -1) {
          state.list[index] = action.payload.updatedMovie;  // Update the movie in the list
        }
      })
      .addCase(updateMovieThunk.rejected, (state, action) => {
        state.loading = false;
        if(!("success" in action.payload)){
          state.noConnection = true;
        }
        state.error = action.payload.message;
      })
      
      // Handle delete movie
      .addCase(deleteMovieThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteMovieThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.list = state.list.filter(movie => movie.id !== action.payload);  // Remove the movie from the list
      })
      .addCase(deleteMovieThunk.rejected, (state, action) => {
        state.loading = false;
        if(!("success" in action.payload)){
          state.noConnection = true;
        }
        state.error = action.payload.message;
      })

      // Handle the fetchMovieByIdThunk states (for fetching a single movie)
      .addCase(fetchMovieByIdThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.movie = null;  // Clear any previous movie data when fetching starts
      })
      .addCase(fetchMovieByIdThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.movie = action.payload.movie;  // Set the fetched movie
      })
      .addCase(fetchMovieByIdThunk.rejected, (state, action) => {
        state.loading = false;
        console.log(action.payload)
        if(!("success" in action.payload)){
          state.noConnection = true;
        }
        state.error = action.payload.message;
        state.movie = null;  // Clear the movie in case of an error
      })

      // Handle the fetchMovieReccomendations states (fetching for a displayed movie)
      .addCase(fetchMovieReccomendations.pending, (state, action) => {
        state.loading = true;
        state.error = null;
        state.list = []
      })
      .addCase(fetchMovieReccomendations.fulfilled, (state, action) => {
        state.loading = false;
        // console.log("action.payload fetchMovieReccomendations",action.payload)
        state.list = action.payload.movies;
      })
      .addCase(fetchMovieReccomendations.rejected, (state, action) => {
        state.loading = false;
        // console.log(action.payload)
        state.error = action.payload.message;
      })

  }
});
export const {resetMovieDetails} = moviesSlice.actions

export default moviesSlice.reducer;


