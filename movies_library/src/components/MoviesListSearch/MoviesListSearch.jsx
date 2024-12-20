import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMoviesThunk } from '../../redux/thunks/moviesThunks';
import { Form, Formik } from 'formik';
import { useLocation, useNavigate } from 'react-router-dom';
import queryString from 'query-string';  // For parsing and constructing query strings
import MovieItem from '../MovieItem/MovieItem';
import SliderPagination from '../SliderPagination/SliderPagination';
import SelectFieldWrapper from '../formsUI/SelectFieldWrapper/SelectFieldWrapper';

const MoviesListSearch = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // Access the movies list, loading state, and error from Redux store
  const { list: movies, loading, error, currentPage, totalPages, totalResults } = useSelector((state) => state.movies);

  // Parse URL query parameters
  // const queryParams = queryString.parse(location.search);
  // State to store query parameters
  const [queryParams, setQueryParams] = useState(queryString.parse(location.search));

  // const [page, setPage] = useState(Number(queryParams.page || 0));
  // const [searchQuery, setSearchQuery] = useState(queryParams.query || '');
  // const [sortOptions, setSortOptions] = useState({
  //   sortParameter: queryParams.sortParameter || '',
  //   sortOrder: queryParams.sortOrder || '',
  // });

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
    // const updatedQuery = queryString.stringify({
    //   query: searchQuery || undefined,
    //   page,
    //   sortParameter: sortOptions.sortParameter || undefined,
    //   sortOrder: sortOptions.sortOrder || undefined,
    // });
    const updatedQuery = queryString.stringify({
      ...queryParams,
    });

    // Push new query parameters to the browser history without reloading the component
    navigate(`?${updatedQuery}`, { replace: true });
  }, [queryParams,  navigate]);//searchQuery, page, sortOptions,

  // Fetch movies when the component mounts, or query parameters change
  useEffect(() => {
    // const fetchParams = {
    //   page: page + 1,
    //   limit: 12,
    //   query: searchQuery || undefined,  // Include search query if available
    //   ...sortOptions,
    // };
    const params = queryString.parse(location.search);
    setQueryParams(params);
    const fetchParams = {
      ...params,
      page: Number(params.page || 1), // Fallback to page 1 if not provided
      limit: 12,
    };
    dispatch(fetchMoviesThunk(fetchParams));

    // dispatch(fetchMoviesThunk(fetchParams));
  }, [location.search, dispatch, ]);//page, sortOptions, searchQuery

  // Handle sort option changes
  // const handleSortChange = (e) => {
  //   const { name, value } = e.target;

  //   setSortOptions((prev) => {
  //     if (name === 'sortParameter') {
  //       setPage(0);  // Reset page to the first one
  //       return {
  //         sortParameter: value,
  //         sortOrder: prev.sortOrder || 'DESC',  // Default to DESC if no sortOrder is set
  //       };
  //     }

  //     if (name === 'sortOrder' && sortOptions.sortParameter) {
  //       setPage(0);  // Reset page when sort order is changed
  //     }

  //     return {
  //       ...prev,
  //       [name]: value,
  //     };
  //   });
  // };
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

  // Render loading state
  if (loading) {
    return <p className='movieListMessage'>Loading movies...</p>;
  }

  // Render error state
  if (error) {
    return <p className='movieListMessage'>Error fetching movies: {error}</p>;
  }
  
  //sortOptions.sortOrder && !sortOptions.sortParameter
  if (queryParams.sortOrder && !queryParams.sortParameter) {
    return <p className='movieListMessage'>Please select a "Sort By" option before choosing the order.</p>;
  }

  return (
    <div className="movies-container">
      {/* Formik for Sorting */}
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

      {/* Display Search Results */}
      {(Boolean(totalResults) || totalResults===0) && <h2>{`Found results: ${totalResults}`}</h2>}
      

      {movies.length === 0 ? (
        <p className='movieListMessage'>No movies found.</p>
      ) : (
        <div className="movies-list">
          {movies.map((movie, idx) => (
            <MovieItem key={idx} movie={movie} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {Boolean(movies.length) && (
        <SliderPagination page={currentPage - 1} 
        onsetPage={(newPage) => 
          setQueryParams((prevParams) => ({ ...prevParams, page: newPage + 1 }))}
        totalPages={totalPages} />
      )}
    </div>
  );
};

export default MoviesListSearch;

