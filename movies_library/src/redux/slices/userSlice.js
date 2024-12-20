// src/store/slices/userSlice.js
import { createSlice } from '@reduxjs/toolkit';
import {fetchUserRatingThunk, submitRatingThunk, logoutUserThunk, resetPasswordThunk, requestPasswordResetThunk, registerUserThunk,fetchUserDataThunk, confirmRegistrationThunk, loginUserThunk} from '../thunks/userThunks';

const userSlice = createSlice({
  name: 'user',
  initialState: {
    details: null,  // User details like ID, email, etc.
    token: null,  // JWT token or session token
    isAuthenticated: false,  // Tracks if the user is logged in
    response: "",
    error: null,
    loading: false,  // Loading state for async actions
    userRating: null,   // Store the user rating for the current movie
    noConnection: false
    // isfetched: false
  },
  reducers: {
    // logout: (state) => {
    //   state.details = null;
    //   state.token = null;
    //   state.isAuthenticated = false;
    // },
    resetResponse: (state) =>{
      state.response = ""
    },
    resetError: (state) =>{
      state.error = false
    },
    // setAuth: (state) =>{
    //   state.isAuthenticated = true
    // }
  },
  extraReducers:(builder)=>{
    builder
    //sign-up
    .addCase(registerUserThunk.pending, (state) => {
      state.response = ""
      state.error = false;
      state.noConnection = false
      state.loading = true;
    })
    .addCase(registerUserThunk.fulfilled, (state, action) => {
      state.loading = false;
      state.response = action.payload.message
      // state.details = action.payload.user;  // Store the user details
      // state.token = action.payload.token;  // Store JWT token or session token
      // state.isAuthenticated = true;
    })
    .addCase(registerUserThunk.rejected, (state, action) => {
      state.loading = false;
      if(!("success" in action.payload)){
        state.noConnection = true
      }
      state.error = action.payload.message;
      // state.error = action.payload.message;  // Store the error message
      // state.isAuthenticated = false;
    })

    //confirm sigh-up
    .addCase(confirmRegistrationThunk.pending, (state) => {
      state.loading = true;
      state.noConnection = false;
      state.error = false;
      state.response = "";
    })
    .addCase(confirmRegistrationThunk.fulfilled, (state, action) => {
      state.response = action.payload.message
      state.loading = false;
    })
    .addCase(confirmRegistrationThunk.rejected, (state, action) => {
      if(!("success" in action.payload)){
        state.noConnection = true
      }
      state.error = action.payload.message;
      state.loading = false;
    })

    //login
    .addCase(loginUserThunk.pending, (state) => {
      state.loading = true;
      state.noConnection = false;
      state.error = false;
      state.response = "";
    })
    .addCase(loginUserThunk.fulfilled, (state, action) => {
      state.token = action.payload.accessToken;
      // Store JWT token in localStorage
      localStorage.setItem('access_token', action.payload.accessToken); 
      state.details = action.payload.user
      state.isAuthenticated = true;
      state.response = action.payload.message
      state.loading = false;
    })
    .addCase(loginUserThunk.rejected, (state, action) => {
      if(!("success" in action.payload)){
        state.noConnection = true;
      }
      state.error = action.payload.message;
      state.loading = false;
    })

    //fetch user
    .addCase(fetchUserDataThunk.pending, (state) => {
      state.loading = true;
      state.noConnection = false;
      state.error = null;
      state.response = "";
    })
    .addCase(fetchUserDataThunk.fulfilled, (state, action) => {
      state.loading = false;
      state.details = action.payload.user;
      state.isAuthenticated = true;
    })
    .addCase(fetchUserDataThunk.rejected, (state, action) => {
      state.loading = false;
      console.log(action.payload)
      if(!("success" in action.payload)){
        state.noConnection = true
      }
      state.error = action.payload.message;
      // state.isfetched = false;
    })


    //logout
    .addCase(logoutUserThunk.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(logoutUserThunk.fulfilled, (state) => {
      state.loading = false;
      state.details = null;
      state.isAuthenticated = false;
      state.token = null;
    })
    .addCase(logoutUserThunk.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload.message;
      state.isAuthenticated = false;
    })

    // Request password reset
    .addCase(requestPasswordResetThunk.pending, (state) => {
      state.loading = true;
      state.noConnection = false;
      state.response = null;
      state.error = null;
    })
    .addCase(requestPasswordResetThunk.fulfilled, (state, action) => {
      state.loading = false;
      state.response = action.payload.message;  // Display success message
    })
    .addCase(requestPasswordResetThunk.rejected, (state, action) => {
      state.loading = false;
      if(!("success" in action.payload)){
        state.noConnection = true
      }
      state.error = action.payload.message;  // Display error message
    })

    // Reset Password Thunk
    .addCase(resetPasswordThunk.pending, (state) => {
      state.loading = true;
      state.noConnection = false;
      state.response = null;
      state.error = null;
    })
    .addCase(resetPasswordThunk.fulfilled, (state, action) => {
      state.loading = false;
      state.response = action.payload.message;  // Server response
    })
    .addCase(resetPasswordThunk.rejected, (state, action) => {
      state.loading = false;
      if(!("success" in action.payload)){
        state.noConnection = true
      }
      state.error = action.payload.message;  // Error message
    })
  }
});

// export const {
//   registerRequest,
//   registerSuccess,
//   registerFailure,
//   logout
// } = userSlice.actions;
export const {resetResponse, resetError} = userSlice.actions

export default userSlice.reducer;

