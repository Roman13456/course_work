import { createAsyncThunk } from '@reduxjs/toolkit';
import userApi from '../../api/userApi';

// Thunk to fetch the user rating for a specific movie
export const fetchUserRatingThunk = createAsyncThunk(
  'userRatings/fetchUserRating',
  async ({ movieId }, { rejectWithValue }) => {
    try {
      const response = await userApi.getUserRating(movieId);
      return response.data;
    } catch (error) {
      return rejectWithValue({
        status: error.status, 
        message: error.response?.data?.message || 'Failed to fetch user rating'
      });
    }
  }
);

// Thunk to submit a new user rating or update an existing rating
export const submitRatingThunk = createAsyncThunk(
  'userRatings/submitRating',
  async ({ movieId, rating }, { getState, rejectWithValue }) => {
    const { user } = getState();

    if (!user.isAuthenticated) {
      return rejectWithValue({message:'User not authenticated'});
    }

    try {
      const response = await userApi.submitRating(movieId, rating);
      return response.data;
    } catch (error) {
      if (error.response) {
        return rejectWithValue({
          success: true,
          message: error.response?.data?.message
        });
      }
      return rejectWithValue({ message: error.message });
    }
  }
);

