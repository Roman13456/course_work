// src/store/slices/recommendationsSlice.js
import { createSlice } from '@reduxjs/toolkit';
import { fetchUserReccomendations } from '../thunks/userThunks';

const recommendationsSlice = createSlice({
  name: 'recommendations',
  initialState: {
    list: [],  // The array of movies
    loading: false,
    //sort
    currentPage: 0,  // Default to page 1
    totalPages: 0,   // Default to a single page
    // totalResults: null,
    noConnection: false,
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      
      //Handle fetch personalized movies
      .addCase(fetchUserReccomendations.pending, (state, action) => {
        state.loading = true;
        state.error = null;
      })
      
      .addCase(fetchUserReccomendations.fulfilled, (state, action) => {
        state.loading = false;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.currentPage;
        state.list = action.payload.recommendations;
      })
      .addCase(fetchUserReccomendations.rejected, (state, action) => {
        state.loading = false;
        if(!("success" in action.payload)){
          state.noConnection = true;
        }
        // console.log(action.payload)
        state.error = action.payload.message;
      })
}
});
// export const {resetMovieDetails} = moviesSlice.actions

export default recommendationsSlice.reducer;

