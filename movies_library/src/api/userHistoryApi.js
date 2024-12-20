// src/api/userHistoryApi.js
import axiosClient from './axiosClient';

const userHistoryApi = {
  getUserHistory: (userId) => axiosClient.get(`/user/${userId}/history`),
};

export default userHistoryApi;
