// src/store/thunks/recommendationsThunks.js
import recommendationsApi from '../../api/recommendationsApi';
import { fetchRecommendationsRequest, fetchRecommendationsSuccess, fetchRecommendationsFailure } from '../slices/recommendationsSlice';

export const fetchRecommendations = (userId, excludedGenres) => async (dispatch) => {
  dispatch(fetchRecommendationsRequest());
  try {
    const response = await recommendationsApi.getRecommendations(userId, excludedGenres);
    dispatch(fetchRecommendationsSuccess(response.data));
  } catch (error) {
    dispatch(fetchRecommendationsFailure(error.message));
  }
};
