// src/api/moviesApi.js
import axiosClient from './axiosClient';

const delay = 1000

const moviesApi = {
  // Fetch movies with pagination

  getMovies: (page, limit, sortParameter, sortOrder, genre) =>{
    return new Promise((resolve, reject) => {
      
      const url = `/movies?page=${page}&limit=${limit}` +
      (sortParameter ? `&sortParameter=${sortParameter}` : '') +
      (sortOrder ? `&sortOrder=${sortOrder}` : '') +
      (genre ? `&genre=${genre}` : '');

      setTimeout(() => {
          axiosClient.get(url)
          .then(response => resolve(response))
          .catch(error => reject(error));
      }, delay); 
    })
    // return axiosClient.get(`/movies?page=${page}&limit=${limit}&sortParameter=${sortParameter}&sortOrder=${sortOrder}`);
  }, 

  getReccomendationsMovie:(genres, id)=>{
    return new Promise((resolve, reject) => {
      // console.log(`/movies?page=${page}&limit=${limit}${sortParameter ? `&sortParameter=${sortParameter}`:``}${sortOrder ? `&sortOrder=${sortOrder}`:''}`)
      setTimeout(() => {
          axiosClient.get(`recommendations/movie?genres=${genres}&id=${id}&page=1&limit=4`)
          .then(response => resolve(response))
          .catch(error => reject(error));
      }, delay); 
    })
  },

  userAddMovieHistory:(movie_id)=>{
    // console.log("movie_id",movie_id)
    axiosClient.post(`/history/add`,{movie_id})
  },


  searchMovies: (page, limit, query, sortParameter, sortOrder) => {
    // console.log("search sorting?")
    return new Promise((resolve, reject) => {
      // Introduce a delay of delay milliseconds (e.g., 2 seconds)
      setTimeout(() => {
        // Construct the search URL with query and optional sort parameters
        axiosClient.get(`/movies/search?page=${page}&limit=${limit}&query=${query}${sortParameter ? `&sortParameter=${sortParameter}` : ''}${sortOrder ? `&sortOrder=${sortOrder}` : ''}`)
          .then(response => resolve(response))
          .catch(error => reject(error));
      }, delay);
    });
  },
  
  // Add a new movie
  addMovie: (movieData) =>{

    return new Promise((resolve, reject) => {
      // Introduce a delay of delay milliseconds (2 seconds)
      setTimeout(() => {
        axiosClient.post('/movies', movieData)
          .then(response => resolve(response))
          .catch(error => reject(error));
      }, 1);
    })
    // axiosClient.post('/movies', movieData),
  },
  
  uploadImage: (file) => {
    const formData = new FormData();
    formData.append('file', file);

    return axiosClient.post('/upload', formData);
  },
  
  deleteImage: (publicId) => {
    return new Promise((resolve, reject) => {
      // Introduce a delay of delay milliseconds (2 seconds)
      setTimeout(() => {
        axiosClient.delete(`/delete/${publicId}`)
          .then(response => resolve(response))
          .catch(error => reject(error));
      }, delay);
    })
    // axiosClient.delete(`/delete/${publicId}`),
  },
  
  
  // Update a movie by its ID
  updateMovie: (movieData) => {
    return new Promise((resolve, reject) => {
      // Introduce a delay of delay milliseconds (2 seconds)
      setTimeout(() => {
        axiosClient.put(`/movies/${movieData.id}`, movieData)
          .then(response => resolve(response))
          .catch(error => reject(error));
      }, delay);
    })
    // axiosClient.put(`/movies/${movieId}`, movieData)
  },
  
  // Delete a movie by its ID
  deleteMovie: (movieId) => axiosClient.delete(`/movies/${movieId}`),

  getGenres: () => axiosClient.get(`/genres`),

  // Fetch a movie by its ID
  getMovieById: (id) => {
    return new Promise((resolve, reject) => {
      // Introduce a delay of delay milliseconds (2 seconds)
      setTimeout(() => {
        axiosClient.get(`/movies/${id}`)
          .then(response => resolve(response))
          .catch(error => reject(error));
      }, delay);
    })
  }, 
  // return axiosClient.get(`/movies/${id}`);


  getFavorites: () => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        axiosClient.get('/favorites')
          .then(response => resolve(response))
          .catch(error => reject(error));
      }, delay); // Adjust the delay as needed
    });
  },

  addFavorite: (movieId) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        axiosClient.post('/favorites', { movieId })
          .then(response => resolve(response))
          .catch(error => reject(error));
      }, delay);
    });
  },

  removeFavorite: (movieId) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        axiosClient.delete(`/favorites/${movieId}`)
          .then(response => resolve(response))
          .catch(error => reject(error));
      }, delay);
    });
  }
};

export default moviesApi;
