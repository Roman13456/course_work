import { createSlice } from '@reduxjs/toolkit';
import { fetchUserRatingThunk, submitRatingThunk } from '../thunks/userRatingsThunks';

const userRatingsSlice = createSlice({
  name: 'userRatings',
  initialState: {
    rating: null,           // Stores the user's rating for the current movie
    loading: false,         // Loading state for async actions
    error: null,            // Error state
    ratingSuccessMessage: null,  // Success message after rating submission
    noConnection: false     // For tracking connection issues
  },
  reducers: {
    resetRatingState: (state) => {
      state.rating = null;
      state.loading = false;
      state.error = null;
      state.ratingSuccessMessage = null;
      state.noConnection = false;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch user rating
      .addCase(fetchUserRatingThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserRatingThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.rating = action.payload.rating;
      })
      .addCase(fetchUserRatingThunk.rejected, (state, action) => {
        state.loading = false;
        if(action.payload.status!==404){
          state.error = action.payload.message;
        }
      })

      // Submit rating
      .addCase(submitRatingThunk.pending, (state) => {
        state.loading = true;
        state.ratingSuccessMessage = null;
        state.error = null;
      })
      .addCase(submitRatingThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.rating = action.payload.updatedRating
        state.ratingSuccessMessage = action.payload.message;
      })
      .addCase(submitRatingThunk.rejected, (state, action) => {
        state.loading = false;
        if (!action.payload?.success) {
          state.noConnection = true;
        }
        state.error = action.payload?.message || 'Unknown error';
      });
  }
});

export const { resetRatingState } = userRatingsSlice.actions;
export default userRatingsSlice.reducer;

