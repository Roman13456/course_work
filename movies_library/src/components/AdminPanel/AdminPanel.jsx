import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { deleteMovieThunk, fetchMoviesThunk } from '../../redux/thunks/moviesThunks';
import { useNavigate, useLocation } from 'react-router-dom';
import queryString from 'query-string';
import { Formik, Form } from 'formik';
import SelectFieldWrapper from '../formsUI/SelectFieldWrapper/SelectFieldWrapper';
import SliderPagination from '../SliderPagination/SliderPagination';
import './AdminPanel.css'; // Create a CSS file specific for styling the table layout
import MyPopup from '../PopUp/PopUp';
import removeIco from "./images/remove2.svg"
import editIco from "./images/edit.png"
import { Button } from "@mui/material";


const AdminPanel = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [openPopup, setOpenPopup] = useState(false)

  const {isAuthenticated, error:UserError, details, loading: userLoading} 
  = useSelector((state) => state.user);
  const { list: movies, loading: moviesLoading, error:MovieError, currentPage, totalPages, 
    totalResults } = useSelector((state) => state.movies);

  const [onDelete, setOnDelete] = useState({
    loading: "",
    id: false
  })

  // State to store query parameters
  const [queryParams, setQueryParams] = useState(queryString.parse(location.search));


  // Sort options
  const sortParameters = [
    { label: 'ID', value: 'id' },
    { label: 'Votes', value: 'vote_average' },
    { label: 'Vote Count', value: 'vote_count' },
    { label: 'Release Date', value: 'release_date' },
  ];

  const sortOrderOptions = [
    { label: 'Ascending', value: 'ASC' },
    { label: 'Descending', value: 'DESC' },
  ];

  // Update URL on sortOptions or page changes
  // Update the URL on page or sortOptions change
  useEffect(() => {
    if(JSON.stringify(queryParams)!==JSON.stringify(queryString.parse(location.search))){
      const updatedQuery = queryString.stringify({
        ...queryParams,
      });
      navigate(`?${updatedQuery}`);//, { replace: true }
    }
  }, [queryParams, navigate]);//page, 


 // Update `queryParams` state and refetch movies when `location.search` changes
 useEffect(() => {
    const params = queryString.parse(location.search);
    setQueryParams(params);
    const fetchParams = {
      ...params,
      page: Number(params.page || 1), // Fallback to page 1 if not provided
      limit: 10,
    };
    dispatch(fetchMoviesThunk(fetchParams));
  }, [location.search, dispatch]);

  const handleSortChange = (e) => {
  const { name, value } = e.target;

    setQueryParams((prevParams) => {
      const newParams = { ...prevParams };

      if (name === 'sortParameter') {
        newParams.sortParameter = value;
        newParams.sortOrder = newParams.sortOrder || 'ASC'; // Default to ASC if not set
      } else if (name === 'sortOrder' && prevParams.sortParameter) {
        newParams.sortOrder = value;
      }
      newParams.page = 1; // Reset to first page on sort change
      return newParams;
    });
  };

  // Handle edit and delete actions
  const handleEdit = (movieId) => navigate(`/adminpanel/editmovie/${movieId}`);
  const handleDelete = (movieId) => {
    // Dispatch delete action or show confirmation
    setOpenPopup(true)
    setOnDelete({
      loading:"",
      id:movieId
    })
    // dispatch(deleteMovieThunk(movieId))
    // console.log(`Delete movie with ID: ${movieId}`);
  };

  // Render error state
  if(userLoading){
    return <p className='movieListMessage'>Loading user...</p>;
  }

  if(UserError){
    return <p className='movieListMessage'>Error fetching user: {UserError}</p>;
  }

  if(!isAuthenticated){
    return <p className='movieListMessage'>User is not authenticated</p>;
  }

  if (!details?.admin) {
    return <p className='movieListMessage'>User does not have admin privileges</p>;
  }

  if (queryParams.sortOrder && !queryParams.sortParameter) {
    return <p className='movieListMessage'>Please select a "Sort By" option before choosing the order.</p>;
  }

  return (
    <div className="admin-panel-container">
      {/* Sorting Form */}
      <Formik initialValues={{sortParameter: queryParams.sortParameter, sortOrder: queryParams.sortOrder }}>
        <Form className="admin-sort-form">
        
        <Button className='createMovieBtn' variant="contained" color="primary"  type='button'
          onClick={() => navigate('/adminpanel/createmovie')}>
            Create Movie
        </Button> 

        {/* <button type='button'   */}
        {/* ></button> */}
          <SelectFieldWrapper
            name="sortParameter"
            label="Sort by"
            options={sortParameters}
            value={queryParams.sortParameter || ""}
            onChange={handleSortChange}
            disabled={moviesLoading}
          />
          <SelectFieldWrapper
            name="sortOrder"
            label="Order"
            disabled={!queryParams.sortParameter || moviesLoading}
            options={sortOrderOptions}
            value={queryParams.sortOrder || ""}
            onChange={handleSortChange}
          />
        </Form>
      </Formik>

      {/* Movies Table */}
      {/* Need another thunk <h2>{`Found results: ${totalResults}`}</h2> */}
      {(Boolean(totalResults) || totalResults===0) && <h2>{`Found results: ${totalResults}`}</h2>}
      

      {moviesLoading ? (
        <p className='movieListMessage'>Loading movies...</p>
      ) : MovieError ? (
        <p className='movieListMessage'>Error fetching movies: {MovieError}</p>
      ) : (
        <>
          <div className='admin-movies-table'>
              <div className='header'>
                  <p>ID</p>
                  <p className=''>Title</p>
                  <p className=''>Description</p>
                  <p className=''>Genres</p>
                  <p className=''>Avg vote</p>
                  <p className=''>Vote count</p>
                  <p className=''>Release date</p>
                  <p>Actions</p>
              </div>
              {movies.map((movie) => (
                <div className='adminItem' key={movie.id}>
                  <p>{movie.id}</p>
                  <p>{movie.title}</p>
                  <p className='overflow2line'>{movie.description}</p>
                  <p className='overflow2line'>{movie.genre?.replaceAll(",", ", ")}</p>
                  <p className='overflow1line'>{movie.vote_average}</p>
                  <p>{movie.vote_count}</p>
                  <p>{movie.release_date 
                  ? new Intl.DateTimeFormat('en', {
                      year: 'numeric', month: 'short', day: 'numeric'
                  }).format(new Date(movie.release_date))
                  : 'Unknown Date'}</p>
                  <div className='actionBtnsContainer'>
                    <button className='editBtn' onClick={() => handleEdit(movie.id)}>
                      <img  src={editIco} alt='edit icon'/>
                    </button>
                    <button className='removeBtn' onClick={() => handleDelete(movie.id)}>
                      <img src={removeIco} alt='remove icon'/>
                    </button>
                  </div>
                </div>
              ))}
          </div>
          {Boolean(movies.length) && (
            <SliderPagination page={currentPage - 1} 
            onsetPage={(newPage) => 
                setQueryParams((prevParams) => ({ ...prevParams, page: newPage + 1 }))}
            totalPages={totalPages} />
          )}
        </>
      )}
      <MyPopup
        open={openPopup}
        setOpen={setOpenPopup}
        text={"You sure you want to delete this movie?"}
        submitBtn={{
          loading:onDelete.loading,
          text:"Confirm",
          cb:async ()=>{
            setOnDelete({...onDelete, loading:"Deleting movie..."})
            const result = await dispatch(deleteMovieThunk(onDelete.id))
            if(deleteMovieThunk.fulfilled.match(result)){
              setOnDelete({...onDelete, loading:
                `Movie with id:${onDelete.id} deleted successfully`})
            }else if(deleteMovieThunk.rejected.match(result)){
              setOnDelete({...onDelete, 
                loading:`Error while deleting movie: ${MovieError || "No connection to server"}`})
            }
            
          }
        }}
      />
      
      {/* Pagination */}
      
    </div>
  );
};

export default AdminPanel;
