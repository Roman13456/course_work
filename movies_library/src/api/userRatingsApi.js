// src/api/userRatingsApi.js
import axiosClient from './axiosClient';

const userRatingsApi = {
  getUserRatings: (userId) => axiosClient.get(`/user/${userId}/ratings`),
};

export default userRatingsApi;
