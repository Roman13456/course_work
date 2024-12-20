// src/store/slices/userHistorySlice.js
import { createSlice } from '@reduxjs/toolkit';

const userHistorySlice = createSlice({
  name: 'userHistory',
  initialState: {
    list: [],  // List of movies watched by the user
    loading: false,  // Tracks loading state
    error: null  // Tracks errors
  },
  reducers: {
    fetchUserHistoryRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchUserHistorySuccess: (state, action) => {
      state.loading = false;
      state.list = action.payload;  // Store the user's watched movies
    },
    fetchUserHistoryFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;  // Store error message
    }
  }
});

export const {
  fetchUserHistoryRequest,
  fetchUserHistorySuccess,
  fetchUserHistoryFailure
} = userHistorySlice.actions;

export default userHistorySlice.reducer;

