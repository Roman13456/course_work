// src/store/thunks/userThunks.js
// src/redux/thunks/userThunks.js
import { createAsyncThunk } from '@reduxjs/toolkit';
import userApi from '../../api/userApi';

// Thunk to handle user registration
export const registerUserThunk = createAsyncThunk(
  'user/register',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await userApi.register(email, password);
      return response.data;
    } catch (error) {
      console.log("reg:",error)
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

// Thunk to confirm user registration
export const confirmRegistrationThunk = createAsyncThunk(
  'user/confirmRegistration',
  async (token, { rejectWithValue }) => {
    try {
      const response = await userApi.confirmRegistration(token);
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

// Thunk for user login
export const loginUserThunk = createAsyncThunk(
  'user/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await userApi.login(email, password);
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


// Thunk to refresh access token
export const refreshAccessTokenThunk = createAsyncThunk(
  'user/refreshToken',
  async (refreshToken, { rejectWithValue }) => {
    try {
      const response = await userApi.refreshAccessToken(refreshToken);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Thunk to log the user out
export const logoutUserThunk = createAsyncThunk(
  'user/logout',
  async (refreshToken, { rejectWithValue }) => {
    try {
      const response = await userApi.logout(refreshToken);
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


export const fetchUserDataThunk = createAsyncThunk(
  'user/fetchUserData',
  async (_, { rejectWithValue }) => {
    try {
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) {
        return rejectWithValue('No access token found');
      }
      
      // Fetch the user details from the backend using the access token
      const response = await userApi.fetchUser();  // Assumes your backend has a /profile endpoint
      return response.data;  // Return the user data
    } catch (error) {
      console.log("fetchuser error", error)
      // Handle error (e.g., token expired)
      if (error.response) {
        return rejectWithValue(error.response.data);  // Return error message from server
      } else if (error.request) {
        return rejectWithValue({message:'No response from the server. Please try again later.'});
      } else {
        return rejectWithValue({message:'An error occurred. Please try again.'});
      }



      // return rejectWithValue(error.response?.data?.message || 'Failed to fetch user data');
    }
  }
);



export const requestPasswordResetThunk = createAsyncThunk(
  'user/requestPasswordReset',
  async ({ email }, { rejectWithValue }) => {
    try {
      const response = await userApi.requestPasswordReset(email);
      return response.data;
    } catch (error) {
      // Handle error if something goes wrong
      if (error.response) {
        return rejectWithValue(error.response.data);  // Return error message from server
      } else if (error.request) {
        return rejectWithValue({message:'No response from the server. Please try again later.'});
      } else {
        return rejectWithValue({message:'An error occurred. Please try again.'});
      }
    }
  }
);


// src/redux/thunks/userThunks.js
// Thunk to reset password using the reset token
export const resetPasswordThunk = createAsyncThunk(
  'user/resetPassword',
  async ({ token, newPassword }, { rejectWithValue }) => {
    try {
      const response = await userApi.resetPassword(token, newPassword);
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



export const submitRatingThunk = createAsyncThunk(
  'user/submitRating',
  async ({ movieId, rating }, { getState, rejectWithValue }) => {
    const { user } = getState();
    console.log("user: getState()", user)

    if (!user.isAuthenticated) {
      return rejectWithValue('User not authenticated');
    }

    try {
      const response = await userApi.submitRating(movieId, rating);
      return response.data;
    } catch (error) {
      if(error.response){
        return rejectWithValue({
          success: true,
          message: error.response?.data?.message
        })
      }
      return rejectWithValue({message:error.message});
    }
  }
);

// Thunk to fetch the user rating for a specific movie
export const fetchUserRatingThunk = createAsyncThunk(
  'user/fetchUserRating',
  async ({ movieId }, { rejectWithValue }) => {
    try {
      const response = await userApi.getUserRating(movieId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user rating');
    }
  }
);


// Thunk to fetch movies with pagination
export const fetchUserReccomendations = createAsyncThunk(
  'user/reccomendations',
  async ({ page, limit, genres}, { rejectWithValue }) => {
    try {
      // Choose the correct API endpoint based on the presence of a search query
      const response = await userApi.getUserReccomendations(page, limit, genres);
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

