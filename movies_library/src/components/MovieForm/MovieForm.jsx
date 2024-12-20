import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import TextfieldWrapper from '../formsUI/TextfieldWrapper';
import TextareaWrapper from '../formsUI/TextareaWrapper/TextareaWrapper';
import SubmitBtn from '../shared/ui/SubmitBtn';
import { fetchMovieByIdThunk, addMovieThunk, updateMovieThunk } from '../../redux/thunks/moviesThunks';
import "./index.css"
import { FormHelperText } from '@mui/material'; // Importing MUI's FormHelperText for error display
import FileInput from "../formsUI/ImageInput/ImageInput";
import MyPopup from '../PopUp/PopUp';
import moviesApi from '../../api/moviesApi';
import GenresListPicker from "../GenresListPicker/GenresListPicker"


const MovieForm = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isEditMode = Boolean(id); // True if editing, false if creating
  const {error:UserError, details, loading: userLoading} 
  = useSelector((state) => state.user);
  const [add_updateSuccessMessage, setAdd_updateSuccessMessage] = useState({uploading: true, message:""})
  const {movie, loading: movieLoading, error, noConnection} = useSelector((state) => state.movies);
  const loading = useSelector((state) => state.movies.loading);
  const [imagePreview, setImagePreview] = useState(null);  // For local preview
  const [selectedImage, setSelectedImage] = useState(null);  // For submission
  
  const [imageError, setImageError] = useState('');  // For image validation feedback

  const [openPopup, setOpenPopup] = useState(false);  // State to control popup visibility
  
  const [isloadedPage, setislodedPage] = useState(false)
  // Fetch movie details if in edit mode
  useEffect(() => {
    async function getMovie(){
      if (isEditMode) {
        const result = await dispatch(fetchMovieByIdThunk(id))
        if(fetchMovieByIdThunk.fulfilled.match(result)){
          setislodedPage(true)
        }
      }
    }
    getMovie()
  }, [isEditMode, id, dispatch]);

  //setImagePreview when in edit mode 
  useEffect(()=>{
    if(movie && isEditMode && isloadedPage){
      if(movie.image[0]==="/"){
        // console.log("tmdb img")
        setImagePreview('https://image.tmdb.org/t/p/w500'+movie.image)
      }else{
        setImagePreview(movie.image)
      }
    }
  },[movie, isEditMode, isloadedPage])

  // Parse date to YYYY-MM-DD format if present
  const parseDateToInputFormat = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    
    // Adjust for timezone offset without shifting the displayed date
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
      .toISOString()
      .split('T')[0];
  };
  

  // Uploads image to Cloudinary only upon form submission
  const handleSubmit = async (values, { setSubmitting }) => {
    setSubmitting(true);
    try {
      let imageUrl = '';
      if ((!selectedImage && !isEditMode)) {//only for create form
        setImageError("Please choose at least one image.")
        setOpenPopup(true); // Show popup if no image is provided
        setSubmitting(false);
        return; // Exit early to prevent form submission
      }
      setAdd_updateSuccessMessage({
        uploading: true, 
        message: "Uploading movie..."
      })
      if (selectedImage) {
        const response = await moviesApi.uploadImage(selectedImage);
        imageUrl = response.data.secure_url;
      }
      
      const movieData = 
      { 
        ...values, 
        image: imageUrl || imagePreview || '' ,
        vote_average: values.vote_average || 0, 
        vote_count: values.vote_count || 0 ,
      };
      // console.log("object to be uploaded to db", movieData, id)
      const action = isEditMode ? updateMovieThunk({ id, ...movieData })
       : addMovieThunk(movieData);

      // console.log("movieData",movieData)
      const result = await dispatch(action);
      if (result.type.includes('fulfilled')) {
        setAdd_updateSuccessMessage({ uploading: false, message: result.payload.message });
      }


    } catch (error) {
      // Ensure there's a fallback message if `error.message` is undefined
      const errorMessage = error?.response?.data?.message || error?.message || 'An unexpected error occurred.';

      setAdd_updateSuccessMessage({ uploading: false, message: +`${errorMessage} Please try again later.`});
      // setOpenPopup(true);
    } finally {
      setSubmitting(false);
    }
  };

  const initialValues = {
    title: (isEditMode && movie?.title) || '',
    description: (isEditMode && movie?.description) || '',
    // genre: (isEditMode && movie?.genre) || '',
    release_date: (isEditMode && parseDateToInputFormat(movie?.release_date)) || new Date().toISOString().split('T')[0],
    vote_average: (isEditMode && movie?.vote_average) || '',
    vote_count: (isEditMode && (movie?.vote_count !== undefined 
      && movie?.vote_count !== null)? movie.vote_count : ''),
    genres: (isEditMode && movie?.genres) || [],
  };
  // Define validation schema with Yup
  const validationSchema = Yup.object({
    title: Yup.string()
    .max(200, 'Title cannot exceed 200 characters')
    .required('Title is required'),
    description: Yup.string().required('Description is required'),
    release_date: Yup.date().required('Release date is required').nullable(),
    vote_average: Yup.number()
      .min(0, 'Vote average cannot be less than 0')
      .max(10, 'Vote average cannot be more than 10'),
      vote_count: Yup.number()
      .integer('Vote count must be an integer') // Ensures it's an integer
      .min(0, 'Vote count cannot be negative'),
    genres: Yup.array().min(1, 'Please select at least one genre'),
  });

  // **onImageChange for previewing the selected image locally**
  // const onImageChange = (input) => {
  //   const file = input.files[0];
   
  //   if (file) {
  //     const reader = new FileReader();
  //     reader.onloadend = () => {
  //       setImagePreview(reader.result); // Set local preview
  //     };
  //     reader.readAsDataURL(file);
  //     console.log("change image",file)
  //     setSelectedImage(file); // Set file for submission
  //   }
  // };
  const onImageChange = (input) => {
    const file = input.files[0];

    if (file) {
      // Validate file type and size
      if (!file.type.startsWith('image/')) {
        setImageError('Please upload a valid image file');
        setOpenPopup(true); 
        return;
      }
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        setImageError('File size exceeds 5MB');
        setOpenPopup(true); 
        return;
      }

      // Clear previous error and set selected image
      setImageError('');
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      setSelectedImage(file);
    }
  };

  if(userLoading){
    return <p className='movieListMessage'>Loading user...</p>;
  }

  if(UserError){
    return <p className='movieListMessage'>Error fetching user: {UserError}</p>;
  }

  if (!details?.admin) {
    return <p className='movieListMessage'>User does not have admin privileges</p>;
  }

  if(movieLoading && !add_updateSuccessMessage.message){
    return (
      <p className='movieListMessage'>Loading movie details...</p>
    )
  }

  if(add_updateSuccessMessage.message){
    return (
      <p className='movieListMessage'>{add_updateSuccessMessage.message} 
      {!add_updateSuccessMessage.uploading && 
      <>
        <br />
        <Link to='#' onClick={()=>navigate(-1)}>Go back</Link>
      </>}
      </p>
    );
  }
  if(noConnection){
    return <p className='movieListMessage'>{error}</p>;
  }
return (
    <div>
      <h2 style={{"textAlign":"center"}}>{isEditMode ? 'Edit Movie' : 'Create Movie'}</h2>
      {<Formik
      enableReinitialize
      initialValues={initialValues}
      onSubmit={handleSubmit}
      validationSchema={validationSchema}
    >
      {({setFieldValue, setFieldTouched, isSubmitting, errors, touched, values }) => (
        <Form className='movieForm'>
          {/* <img src={imagesData[0]}></img> */}
          <div className='FormImage'>
            <FileInput
             image={imagePreview} className="inputFile" 
             onChange={(e)=>onImageChange(e.target)} ></FileInput>
             {Boolean(isEditMode) &&
             <>
             <p style={{textAlign:"center"}}>
              ↑ Click to select a new image
            </p>
            <p>
            &nbsp;&nbsp;P.S.
              <br/>
              The image will only be updated after successfully submitting the form.
              <br/>
              <br/>
              If you've already changed it and want to revert, simply reload the page.
            </p>
             </>}
             

          </div>
          
          <div className='rightContainer'>
            <TextfieldWrapper name="title" label="Title" />
            <TextareaWrapper placeholder={"Enter movie's description"} 
            name="description"  label="Description" />
            <GenresListPicker 
                genres={values.genres}
                setFieldValue={setFieldValue}
                errors={errors}
                touched={touched}
                setFieldTouched={setFieldTouched}
            />
            {/* <TextfieldWrapper name="genre" label="Genres (comma-separated)" /> */}
            <TextfieldWrapper name="release_date" label="Release Date" type="date" />
            <TextfieldWrapper name="vote_average" label="Vote Average(optional)" type="number" />
            <TextfieldWrapper name="vote_count" label="Vote Count(optional)" type="number" />
            <SubmitBtn text={isEditMode ? 'Update Movie' : 'Create Movie'} disabled={isSubmitting || loading} />
          </div>
           </Form>
      )}
    </Formik>
      }
      <MyPopup
        open={openPopup}
        // title={"Wa"}
        setOpen={setOpenPopup}
        text={imageError}
      />
    </div>
  );
};

export default MovieForm;

