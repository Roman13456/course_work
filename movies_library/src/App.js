import LoginForm from './components/Registerform/LoginForm';
import { Route, Routes } from 'react-router-dom';
import Navigation from './components/Navigation/Navigation';
import { useEffect, useState } from 'react';
import SignupConfirmation from "./components/Registerform/SignupConfirmation/SignupConfirmation"
import ResetPassword from"./components/Registerform/EmailConfirmation/ResetPassword/ResetPassword"
import EmailConfirmation from './components/Registerform/EmailConfirmation/EmailConfirmation';
import SignupForm from './components/Registerform/SignupForm/SignupForm';
import NotFound from './components/NotFound/NotFound';
import SignedUp from './components/Registerform/SignedUp/SignedUp';
import { useSelector, useDispatch } from 'react-redux';
import { fetchUserDataThunk } from './redux/thunks/userThunks';
import MovieDetails from './components/MovieDetails/MovieDetails';
import MoviesList from './components/MoviesList/MoviesList';
import MoviesListSearch from './components/MoviesListSearch/MoviesListSearch';
// Import Admin Panel and Admin Movie Forms
import AdminPanel from './components/AdminPanel/AdminPanel';
import MovieForm from './components/MovieForm/MovieForm';
import UserReccomendations from './components/UserReccomendations/UserReccomendations';
import NavBurger from './components/NavBurger/NavBurger';
import { fetchFavorites } from './redux/slices/favoritesSlice';
import UserFavorites from './components/UserFavorites/UserFavorites';


function App() {
  const dispatch = useDispatch();
  const {isAuthenticated} = useSelector((state) => state.user);
  // const [cartGuestMode, setcartGuestMode] = useState(true)

  useEffect(() => {
    // Check if there's an access token in localStorage and fetch user data
    const token = localStorage.getItem('access_token');
    if (token) {
      dispatch(fetchUserDataThunk());  // Dispatch the fetch user data thunk
    }
  }, [dispatch]);

  useEffect(()=>{
    if(isAuthenticated){
      dispatch(fetchFavorites());
    }
  },[isAuthenticated, dispatch])

  
  return (
    <>
    <NavBurger/>
    {/* <Navigation/> */}
    <Routes>
      {/* <Route path='images' element={<PreviewList />} /> */}
      {/* Movie Routes */}
      <Route path='movies/search' element={<MoviesListSearch/>} />  {/* New search route */}
      <Route path='movies' element={<MoviesList/>} />
      <Route path="/movie/:id" element={<MovieDetails />} />  {/* Route for specific movie */}
      <Route path='favorites' element={<UserFavorites/>} />
      <Route path="/recommendations/personalized" element={<UserReccomendations />} />
      {/* Authentication Routes */}
      <Route path='login' element={<LoginForm/>} />
      <Route path='signedup' element={<SignedUp/>}/>
      <Route path='email-confirmed/:token' element={<SignupConfirmation></SignupConfirmation>} />
      <Route path='reset-password/:token' element={<ResetPassword />} />
      <Route path='reset-password' element={<EmailConfirmation />} />
      <Route path='signup' element={<SignupForm />} />
      

       {/* Admin Routes */}
       <Route path='adminpanel' element={<AdminPanel />} />  {/* Admin panel route */}
          <Route path="adminpanel/createmovie" element={<MovieForm />} />
          <Route path="adminpanel/editmovie/:id" element={<MovieForm />} />

      {/* Catch-all route for undefined paths */}
      <Route path="*" element={<NotFound />} />
    </Routes>
    </>
  );
}

export default App;
