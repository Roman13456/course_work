// src/api/userApi.js
import axiosClient from './axiosClient';
const delay = 1000

const userApi = {
  // Register user (send confirmation email)
  register: (email, password) => {
    // return axiosClient.post('/register', { email, password });

    return new Promise((resolve, reject) => {
      // Introduce a delay of delay milliseconds (2 seconds)
      setTimeout(() => {
        axiosClient.post('/register', { email, password })
          .then(response => resolve(response))
          .catch(error => reject(error));
      }, delay); // Adjust the delay time as needed
    });
  },

  // Confirm registration by token
  confirmRegistration: (token) => {
    return new Promise((resolve, reject) => {
      // Introduce a delay of delay milliseconds (2 seconds)
      setTimeout(() => {
        axiosClient.post(`/email-confirmed/${token}`)
          .then(response => resolve(response))
          .catch(error => reject(error));
      }, delay); // Adjust the delay time as needed
    });

    // return axiosClient.post(`/email-confirmed/${token}`);
  },

  // Login user
  login: (email, password) => {
    return new Promise((resolve, reject) => {
      // Introduce a delay of delay milliseconds (2 seconds)
      setTimeout(() => {
        axiosClient.post('/login', { email, password }, { withCredentials: true })
          .then(response => resolve(response))
          .catch(error => reject(error));
      }, delay); // Adjust the delay time as needed
    });
    // return axiosClient.post('/login', { email, password });
  },

  // Refresh access token
  refreshAccessToken: (refreshToken) => {
    return axiosClient.post('/refresh-token', { token: refreshToken }, { withCredentials: true });
  },

  // Logout user (revoke refresh token)
  logout: (refreshToken) => {
    return new Promise((resolve, reject) => {
      // Introduce a delay of delay milliseconds (2 seconds)
      setTimeout(() => {
        axiosClient.post('/logout', { token: refreshToken }, { withCredentials: true })
          .then(response => resolve(response))
          .catch(error => reject(error));
      }, delay); // Adjust the delay time as needed
    });

    // return axiosClient.post('/logout', { token: refreshToken }, { withCredentials: true });
  },

  // get user (using access token)
  fetchUser: () => {
    // return axiosClient.get('/user/profile');
    return new Promise((resolve, reject) => {
      // Introduce a delay of delay milliseconds (2 seconds)
      setTimeout(() => {
          axiosClient.get('/user/profile')
          .then(response => resolve(response))
          .catch(error => reject(error));
      }, delay); // Adjust the delay time as needed
    });
  },
  requestPasswordReset: (email) => {
    return new Promise((resolve, reject) => {
      // Introduce a delay of delay milliseconds (2 seconds)
      setTimeout(() => {
        axiosClient.post('/request-password-reset', { email })
          .then(response => resolve(response))
          .catch(error => reject(error));
      }, delay); // Adjust the delay time as needed
    })
    // return axiosClient.post('/request-password-reset', { email });
  },
  resetPassword: (token, newPassword) => {
    return new Promise((resolve, reject) => {
      // Introduce a delay of delay milliseconds (2 seconds)
      setTimeout(() => {
        axiosClient.post(`/reset-password`, { token, newPassword })
          .then(response => resolve(response))
          .catch(error => reject(error));
      }, delay); // Adjust the delay time as needed
    })
    // return axiosClient.post(`/reset-password`, { token, newPassword });
  },

  submitRating: (movieId, rating) => {

    return new Promise((resolve, reject) => {
      // Introduce a delay of delay milliseconds (2 seconds)
      setTimeout(() => {
          axiosClient.post('/rate-movie', {
            movieId,
            rating,
          })
          .then(response => resolve(response))
          .catch(error => reject(error));
      }, delay); // Adjust the delay time as needed
    })
    // return axiosClient.post('/rate-movie', {
    //   movieId,
    //   rating,
    // });
  },

  //
  getUserGenreWeights: () => {
    return new Promise((resolve, reject) => {
      // Introduce a delay of delay milliseconds (2 seconds)
      setTimeout(() => {
          axiosClient.get('/recommendations/user-genre-weights')
          .then(response => resolve(response))
          .catch(error => reject(error));
      }, 1); // Adjust the delay time as needed
    })
    //http://localhost:3001/api/recommendations/user-genre-weights
  },


  getUserReccomendations: (page, limit, genres) => {
    return new Promise((resolve, reject) => {
      // Introduce a delay of delay milliseconds (2 seconds)
      setTimeout(() => {
          axiosClient.get(`recommendations/personalized?page=${page}&limit=${limit}${ genres?`&unwantedGenres=${genres}`:""}`)
          .then(response => resolve(response))
          .catch(error => reject(error));
      }, delay); // Adjust the delay time as needed
    })
    //http://localhost:3001/api/recommendations/user-genre-weights
  },


  //  getUserRating : (movieId) => {
  //   return new Promise((resolve, reject) => {
  //     // Introduce a delay of delay milliseconds (2 seconds)
  //     setTimeout(() => {
  //       axiosClient.get(`/user-rating/${movieId}`, { withCredentials: true })
  //         .then(response => resolve(response))
  //         .catch(error => reject(error));
  //     }, delay); // Adjust the delay time as needed
  //   })
  //   // return axiosClient.get(`/user-rating/${movieId}`, { withCredentials: true });
  // },
  getUserRating: (movieId) => {
    return new Promise((resolve, reject) => {
      // Introduce a delay of delay milliseconds (2 seconds)
      setTimeout(() => {
        axiosClient.get(`/user-rating/${movieId}`)
          .then(response => resolve(response))
          .catch(error => reject(error));
      }, 1); // Adjust the delay time as needed
    })
    // return axiosClient.get(`/user-rating/${movieId}`); // Replace with your actual API path
  },

};

export default userApi;

