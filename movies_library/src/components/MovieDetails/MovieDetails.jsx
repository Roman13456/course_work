import React, { useEffect,useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';  // For getting the movie ID from the URL
import { fetchMovieByIdThunk, fetchMovieReccomendations } from '../../redux/thunks/moviesThunks';  // Thunk to fetch a specific movie
import './MovieDetails.css';  // Add some styles if needed
// import { submitRatingThunk } from '../../redux/thunks/userThunks';
import { fetchUserRatingThunk, submitRatingThunk } from '../../redux/thunks/userRatingsThunks';  // Thunks for fetching and submitting ratings
import MyPopup from '../PopUp/PopUp';
import UserRatingStars from '../userRatingStars/userRatingStars';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';  // For validation schema
import SubmitBtn from "../shared/ui/SubmitBtn";
import MovieItem from '../MovieItem/MovieItem';
import moviesApi from '../../api/moviesApi';
import ChangeFavorites from './ChangeFavorites/ChangeFavorites';
import { addFavorite, removeFavorite } from '../../redux/slices/favoritesSlice';
import editIco from "./images/white_pen.png"
import editIcoHover from "./images/gray_pen.png"
import { resetRatingState } from '../../redux/slices/userRatingsSlice';

// Validation schema for rating
const RatingSchema = Yup.object().shape({
  rating: Yup.number().min(1, "Rating must be at least 1").max(10, "Rating can't be more than 10").required('Rating is required'),
});


const MovieDetails = () => {
  const { id } = useParams();  // Get the movie ID from the URL params
  const dispatch = useDispatch();
  
  // Get the movie details and loading/error state from Redux
  const { movie, list:recommendedMovies, loading: movieLoading, error: movieError } 
  = useSelector((state) => state.movies);
  const { rating, noConnection, loading: ratingLoading, error: ratingError, ratingSuccessMessage } 
  = useSelector((state) => state.userRatings);
  // const user = useSelector((state) => state.user);  // Get user authentication status
  const { isAuthenticated } = useSelector((state) => state.user);
  const { list:favorites } = useSelector((state) => state.favorites);

  const [openPopup, setOpenPopup] = useState(false);  // State to control popup visibility
  const [userRating, setUserRating] = useState(1);  // State to store the user's rating

  useEffect(() => {
    if (id) {
      dispatch(fetchMovieByIdThunk(id));
      dispatch(resetRatingState());
      setUserRating(1)
      
    }
  }, [dispatch, id]);


  useEffect(()=>{
    if(movie?.id === +id && isAuthenticated){
        moviesApi.userAddMovieHistory(id)
        dispatch(fetchUserRatingThunk({ movieId: id }));
    }
  },[movie, isAuthenticated, dispatch, id])

  useEffect(()=>{
    if(movie?.id === +id) dispatch(fetchMovieReccomendations({genres: movie?.genre, id}))
  },[movie, dispatch, id])

  // Listen for changes in the user's rating pulled from the server
  useEffect(() => {
    if (rating && +(rating?.movie_id)===+id) {
      setUserRating(rating?.rating);  // Set user rating with the fetched rating
      console.log("Set rating for", rating?.movie_id)
    }
    
  }, [rating]);

   // Function to open the popup
   const handleRateClick = () => {
    setOpenPopup(true);
  };

  // Function to submit rating (for now, just console log it)
  const handleSubmitRating = (values, { setSubmitting }) => {
    console.log("userRating",userRating)
    if (isAuthenticated) {
      dispatch(submitRatingThunk({ movieId: id, rating: userRating }));
    }
    setSubmitting(false);
  };

  // Check if the movie is in the favorites list
  const isFavorite = favorites.some((movie) => movie.id === parseInt(id, 10));

  //on add/delete movie from favorites
  function onAddOrDelete(state){
    if(isAuthenticated){
      if(state){
        dispatch(addFavorite(movie))
      }else{
        dispatch(removeFavorite(+id))
      }
    }else{
      setOpenPopup(true);
    }
  }
  const [ishovered, setIsHovererd] = useState(false)

  // Render loading state
  if (movieLoading) {
    return <p className='movieListMessage'>Loading movie details...</p>;
  }

  // Render error state
 if (movieError) {
    return <p className='movieListMessage'>Error: {movieError}</p>;
  }

  // Render the movie details
  return (
    <>
    <div className="movie-metadata">
      {movie ? (
        <>
          <img src={movie.image[0]==="/"? 'https://image.tmdb.org/t/p/w500'+movie.image:movie.image} alt={movie.title} className="movie-poster-img" />
          <div>
            <h2>{movie.title}</h2>
            <p>{movie.description}</p>
            <p>Genres: {movie.genre.replaceAll(",", ", ")}</p>
            {/* <p>Popularity: {movie.popularity}</p> */}
            <div className='votingContainer'>
              <p className='voteAvgScore'>Vote Average: {Number(movie.vote_average).toFixed(2)}</p>
              <div className='userRatingContainer'>
                {isAuthenticated && (rating && +rating?.movie_id===+id)  ? (
                  <div className="ratingAndEditContainer">
                    <p>Your rating: {rating?.rating}/10</p>
                    <button type="button" className="editRatingBtn" 
                    onMouseEnter={() => setIsHovererd(true)}
                    onMouseLeave={() => setIsHovererd(false)}
                    onClick={handleRateClick}>
                      <img src={ishovered?editIcoHover:editIco} alt="edit your movie rating"/>
                    </button>
                    {/* <Link to={"#"} onClick={handleRateClick}>change</Link> */}
                  </div>
                ):<Link to={"#"} onClick={handleRateClick}>rate yourself</Link>}
                <ChangeFavorites access={isAuthenticated} isFavorite={isFavorite} onSave={onAddOrDelete}/>
              </div>
              
            </div>
            
            <p>Vote Count: {movie.vote_count}</p>
            <p>Release Date: {new Date(movie.release_date).toDateString()}</p>
          </div>
          
        </>
      ) : (
        <p>No movie found.</p>
      )}
      
      <MyPopup
        open={openPopup}
        title={"Rate the movie"}
        setOpen={setOpenPopup}
        text={isAuthenticated ? (
          <Formik
            initialValues={{ rating: userRating }}  // Initialize with the current rating
            validationSchema={RatingSchema}
            onSubmit={handleSubmitRating}
            enableReinitialize  // Reinitialize form when initial values change
          >
            {({ values, setFieldValue, isSubmitting }) => (
              <Form className='rateForm'>
                {ratingLoading ? "Loading..." : (
                  noConnection ? <p>{ratingError}</p> :
                  <>
                    <p>Please enter your rating (1-10):</p>
                    
                    {/* Use UserRatingStars as a form field */}
                    <Field name="rating">
                      {({ field }) => (
                        <UserRatingStars
                          rating={values.rating}
                          onSave={(newRating) => {
                            setUserRating(newRating)
                            setFieldValue('rating', newRating)
                          }}  // Update form value on star click
                        />
                      )}
                    </Field>
                    <ErrorMessage name="rating" component="div" className="error-message" />
                    
                    {ratingSuccessMessage && <p>{ratingSuccessMessage}</p>}
                    {ratingError && <p>Error: {ratingError}</p>}
                    
                    <SubmitBtn text="Submit"  type="submit" disabled={isSubmitting}></SubmitBtn>
                  </>
                )}
              </Form>
            )}
          </Formik>
        ) : "Please log in to rate/add movie to favorites."}
      />
    </div>
    {movieLoading?<p className='movieListMessage'>Loading recommended...</p>:
        <div className='reccomendedMovies'>
          {Boolean(recommendedMovies) && <h2>You might be interested in:</h2>}
        
          {Boolean(recommendedMovies) && recommendedMovies?.map((movie, idx) => (
              <MovieItem key={idx} movie={movie} />
          ))}

        </div>
    }
  </>
  );
};

export default MovieDetails;
