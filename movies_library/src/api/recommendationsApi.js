// src/api/recommendationsApi.js
import axiosClient from './axiosClient';

const recommendationsApi = {
  getRecommendations: (userId, excludedGenres) => axiosClient.post(`/user/${userId}/recommendations`, { excludedGenres }),
};

export default recommendationsApi;
