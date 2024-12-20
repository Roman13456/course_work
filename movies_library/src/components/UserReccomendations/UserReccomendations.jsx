import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMoviesThunk } from '../../redux/thunks/moviesThunks';
import './UserReccomendations.css';
import MovieItem from '../MovieItem/MovieItem';
import SliderPagination from '../SliderPagination/SliderPagination';
import { useLocation, useNavigate } from 'react-router-dom';
import queryString from 'query-string';  // For parsing and constructing query strings
import GenreForm from '../GenreForm/GenreForm';
import { fetchUserReccomendations } from '../../redux/thunks/userThunks';

const UserReccomendations = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // Access the movies list, loading state, and error from Redux store
  // const { list: movies, loading, MovieError, currentPage, totalPages } = useSelector((state) => state.movies);
  const { list: movies, loading:MoviesLoading, error:RecError, currentPage, totalPages } 
  = useSelector((state) => state.recommendations);
  // Parse URL query parameters
  const [queryParams, setQueryParams] = useState(queryString.parse(location.search));
  const [excludedGenres, setExcludedGenres] = useState([])


  const {isAuthenticated, error:UserError, loading: userLoading} 
  = useSelector((state) => state.user);

  // Update the URL when sortOptions or page changes
  useEffect(() => {
    const updatedQuery = queryString.stringify({
      ...queryParams,
    });

    // Push new query parameters to the browser history without reloading the component
    navigate(`?${updatedQuery}`, { replace: true });
  }, [queryParams, navigate]);//page, sortOptions,
  
  function onExcludeGenres(genres){
    const fetchParams = {
      page: 1, // Fallback to page 1 if not provided
      limit: 12,
      genres
    };
    // console.log("genres",genres)
    setQueryParams(fetchParams);
  }

  // // Fetch movies when the component mounts, page or sort options change
  useEffect(() => {
    const params = queryString.parse(location.search);
    setQueryParams(params);
    // console.log("params.genres",params.genres)
    if(params.genres) {
      setExcludedGenres([...params.genres.split(",")])
    }else{
      setExcludedGenres([])
    }

    const fetchParams = {
      page: Number(params.page || 1), // Fallback to page 1 if not provided
      limit: 12,
      genres:`${params.genres || ""}`
    };
    dispatch(fetchUserReccomendations(fetchParams));
  }, [location.search, dispatch]);
  // useEffect(() => {
  //   dispatch(fetchMoviesThunk({page: page + 1, limit: 12, ...sortOptions}));
  // }, [dispatch, page, sortOptions]);

  // Render loading state
  if(!isAuthenticated && !userLoading){
    return <p className='movieListMessage'>Not authenticated users can't use recommendations...</p>;
  }
  
  if(userLoading){
    return <p className='movieListMessage'>Loading user...</p>;
  }

  if(UserError){
    return <p className='movieListMessage'>Error fetching user: {UserError}</p>;
  }
  
  if (MoviesLoading) {
    return <p className='movieListMessage'>Loading recommended movies...</p>;
  }

  // Render error state
  if (RecError) {
    return <p className='movieListMessage'>Error fetching movies: {RecError}</p>;
  }

  if (queryParams.sortOrder && !queryParams.sortParameter) {
    return <p className='movieListMessage'>Please select a "Sort By" option before choosing the order.</p>;
  }

  
  // Render the movie list
  return (
    <div className="movies-container">
        <h2>Personalized recommendations</h2>
        <GenreForm onSubmit={onExcludeGenres} excludedGenres={excludedGenres}/>

      {movies.length === 0 ? (
        <p className='movieListMessage'>No movies found.</p>
      ) : (
        <div className="movies-list">
          {movies.map((movie, idx) => (
            <MovieItem key={idx} movie={movie} />
          ))}
        </div>
      )}
      
      {Boolean(movies.length) && <SliderPagination page={currentPage - 1} 
      onsetPage={(newPage) => 
        setQueryParams((prevParams) => ({ ...prevParams, page: newPage + 1 }))}
      totalPages={totalPages} />} 
    </div>
  );
};



export default UserReccomendations;