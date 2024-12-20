import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import moviesApi from '../../api/moviesApi';

// Async thunks
export const fetchFavorites = createAsyncThunk('favorites/fetchFavorites', async (_, { rejectWithValue }) => {
    try {
        const response = await moviesApi.getFavorites();
        return response.data.favorites;
    } catch (error) {
        if (error.response) {
            return rejectWithValue(error.response.data);  // Return error from server
          } else if (error.request) {
            return rejectWithValue({message:'No response from the server. Please try again later.'});
          } else {
            return rejectWithValue({message:'An error occurred. Please try again.'});
          }
    }
});

export const addFavorite = createAsyncThunk('favorites/addFavorite', async (movie, { rejectWithValue }) => {
    try {
        const response = await moviesApi.addFavorite(movie.id);
        return movie;
    } catch (error) {
        if (error.response) {
            return rejectWithValue(error.response.data);  // Return error from server
          } else if (error.request) {
            return rejectWithValue({message:'No response from the server. Please try again later.'});
          } else {
            return rejectWithValue({message:'An error occurred. Please try again.'});
          }
    }
});

export const removeFavorite = createAsyncThunk('favorites/removeFavorite', async (movieId, { rejectWithValue }) => {
    try {
        await moviesApi.removeFavorite(movieId);
        return movieId;
    } catch (error) {
        if (error.response) {
            return rejectWithValue(error.response.data);  // Return error from server
          } else if (error.request) {
            return rejectWithValue({message:'No response from the server. Please try again later.'});
          } else {
            return rejectWithValue({message:'An error occurred. Please try again.'});
          }
    }
});

const favoritesSlice = createSlice({
    name: 'favorites',
    initialState: {
        list: [],
        loading: false,
        ondeleteLoading: false,
        error: null,
    },
    reducers: {
        onLogoutFavorites:(state)=>{
            state.list = [];
            state.loading = false;
            state.ondeleteLoading = false;
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            //fetch favorites
            .addCase(fetchFavorites.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchFavorites.fulfilled, (state, action) => {
                state.loading = false;
                state.list = action.payload;
            })
            .addCase(fetchFavorites.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            //add to favorites
            .addCase(addFavorite.fulfilled, (state, action) => {
                state.list.push(action.payload);
            })

            //remove from favorites
            .addCase(removeFavorite.pending, (state, action) => {
                state.ondeleteLoading = true
            })
            .addCase(removeFavorite.fulfilled, (state, action) => {
                state.list = state.list.filter((movie) => movie.id !== action.payload);
                state.ondeleteLoading = false
            })
            .addCase(removeFavorite.rejected, (state, action) => {
                state.ondeleteLoading = false
                // state.error = action.payload;
            });
    },
});


export const {onLogoutFavorites} = favoritesSlice.actions
export default favoritesSlice.reducer;
