import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import moviesReducer from './slices/moviesSlice';
import recommendationsReducer from './slices/recommendationsSlice';
import userHistoryReducer from './slices/userHistorySlice';
import userRatingsReducer from './slices/userRatingsSlice';
import favoritesSlice from "./slices/favoritesSlice"

export const store = configureStore({
  reducer: {
    user: userReducer,
    movies: moviesReducer,
    recommendations: recommendationsReducer,
    userHistory: userHistoryReducer,
    favorites: favoritesSlice,
    userRatings: userRatingsReducer
  },
  devTools: process.env.NODE_ENV !== 'production',
});


