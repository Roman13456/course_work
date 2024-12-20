

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMoviesThunk } from '../../redux/thunks/moviesThunks';
import './MoviesList.css';
import MovieItem from '../MovieItem/MovieItem';
import SliderPagination from '../SliderPagination/SliderPagination';
import SelectFieldWrapper from '../formsUI/SelectFieldWrapper/SelectFieldWrapper';
import { Form, Formik } from 'formik';
import { useLocation, useNavigate } from 'react-router-dom';
import queryString from 'query-string';  // For parsing and constructing query strings

const MoviesList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // Access the movies list, loading state, and error from Redux store
  const { list: movies, loading, error, currentPage, totalPages } = useSelector((state) => state.movies);

  
  const [queryParams, setQueryParams] = useState(queryString.parse(location.search));

  const sortParameters = [
    { label: 'Votes', value: 'vote_average' },
    { label: 'Vote Count', value: 'vote_count' },
    { label: 'Release Date', value: 'release_date' },
  ];

  const sortOrderOptions = [
    { label: 'Ascending', value: 'ASC' },
    { label: 'Descending', value: 'DESC' },
  ];


  // Update the URL when sortOptions or page changes
  useEffect(() => {
    const updatedQuery = queryString.stringify({
      ...queryParams,
    });
    // Push new query parameters to the browser history without reloading the component
    navigate(`?${updatedQuery}`, { replace: true });
  }, [queryParams, navigate]);//page, sortOptions,

  // // Fetch movies when the component mounts, page or sort options change
  useEffect(() => {
    
    const params = queryString.parse(location.search);
    setQueryParams(params);
    const fetchParams = {
      ...params,
      page: Number(params.page || 1), // Fallback to page 1 if not provided
      limit: 12,
    };
    
    dispatch(fetchMoviesThunk(fetchParams));
  }, [location.search, dispatch]);

  // Render loading state
  if (loading) {
    return <p className='movieListMessage'>Loading movies...</p>;
  }

  // Render error state
  if (error) {
    return <p className='movieListMessage'>Error fetching movies: {error}</p>;
  }

  if (queryParams.sortOrder && !queryParams.sortParameter) {
    return <p className='movieListMessage'>Please select a "Sort By" option before choosing the order.</p>;
  }


  const handleSortChange = (e) => {
    const { name, value } = e.target;

    setQueryParams((prevParams) => {
      const newParams = { ...prevParams };

      if (name === 'sortParameter') {
        newParams.sortParameter = value;
        newParams.sortOrder = newParams.sortOrder || 'DESC'; // Default to ASC if not set
      } else if (name === 'sortOrder' && prevParams.sortParameter) {
        newParams.sortOrder = value;
      }
      newParams.page = 1; // Reset to first page on sort change
      return newParams;
    });
  };
  // Render the movie list
  return (
    <div className="movies-container">
      <Formik initialValues={{sortParameter: queryParams.sortParameter, sortOrder: queryParams.sortOrder }}>
        {() => (
          <Form className='sortForm'>
            <SelectFieldWrapper
              name="sortParameter"
              label="Sort by"
              options={sortParameters}
              value={queryParams.sortParameter || ""}
              onChange={handleSortChange}
            />
            <SelectFieldWrapper
              name="sortOrder"
              label="Order"
              disabled={!queryParams.sortParameter}
              options={sortOrderOptions}
              value={queryParams.sortOrder || ""}
              onChange={handleSortChange}
            />
          </Form>
        )}
      </Formik>
       {queryParams?.genre && <h2><span>Chosen genre: </span>{queryParams.genre}</h2>}

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

export default MoviesList;

