// src/store/thunks/userHistoryThunks.js
import userHistoryApi from '../../api/userHistoryApi';
import { fetchUserHistoryRequest, fetchUserHistorySuccess, fetchUserHistoryFailure } from '../slices/userHistorySlice';

export const fetchUserHistory = (userId) => async (dispatch) => {
  dispatch(fetchUserHistoryRequest());
  try {
    const response = await userHistoryApi.getUserHistory(userId);
    dispatch(fetchUserHistorySuccess(response.data));
  } catch (error) {
    dispatch(fetchUserHistoryFailure(error.message));
  }
};
