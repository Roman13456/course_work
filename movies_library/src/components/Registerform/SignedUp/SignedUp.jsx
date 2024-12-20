import { React, useEffect,useState } from 'react';
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { logoutUserThunk } from "../../../redux/thunks/userThunks"
import "../index.css";
import { onLogoutFavorites } from '../../../redux/slices/favoritesSlice';
import { resetRatingState } from '../../../redux/slices/userRatingsSlice';

function SignedUp() {
  const dispatch = useDispatch();
  // const navigate = useNavigate();
  
  const { details, loading, isAuthenticated, error} = useSelector((state) => state.user);  // Access user details from Redux

  // Logout handler

  const onLogout = async () => {
    const resultAction = await dispatch(logoutUserThunk());
   
    // Check if the action was successful (fulfilled)
    if (logoutUserThunk.fulfilled.match(resultAction)) {
        // Navigate to the desired page if successful
        dispatch(onLogoutFavorites())
        dispatch(resetRatingState())
        localStorage.removeItem('access_token');  // Remove access token from localStorage
        // navigate('/login');  // Redirect to login page
    }
  };
  return (
    <div className="loginForm">
        {loading?<p className="formTitle message">Loading...</p>:(
          error?<p className="formTitle message">{error}</p>:(
            isAuthenticated? <>
            <div className="formContainerInputs">
              <p className="formTitle">Welcome, {details?.email}!</p>
              <p>Your email: {details?.email}</p>
              {Boolean(details.admin)&&<p>User has admin privileges</p>}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", marginTop: '20px' }}>
              <Link onClick={onLogout} to="#">Want to leave the account? Press here</Link>
            </div>
          </>:
          <>
            <div className="formContainerInputs">
                <p className="formTitle message">You are not logged in</p>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", marginTop: '20px' }}>
                {loading || isAuthenticated?<p></p>:<><Link to="/login">Are you signed-up? Log in</Link>
                  <Link to="/signup">Don't have an account? Sign up</Link></>}
                
            </div>
          </>
          ))
        }
    </div>
  );
}

export default SignedUp;









// import { Link } from "react-router-dom";
// import { useCookies } from "react-cookie";
// import { useDispatch, useSelector } from "react-redux";
// import { clearUser } from "../../../store/reducers/user.reducers";
// function SignedUp() {
//     const dispatch = useDispatch()
//     const user = useSelector((state) => state.USER);
//     const [cookies, setCookie, removeCookie] = useCookies(['credentials']);
//     function onDel(){
//         // dispatch(clearUser())
//         // console.log(cookies)
//         // removeCookie('credentials');
//         // const updatedCookies = { ...cookies };
//         // delete updatedCookies.credentials;

//         // // Set the updated cookies state
//         // setCookie(Object.keys(updatedCookies), Object.values(updatedCookies));
//         // // setCookie(['credentials'])
//         // console.log("after")
//         // console.log(cookies)
//         dispatch(clearUser());

//         // Delete the 'credentials' cookie
//         document.cookie = 'credentials=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';

//         // Update the cookies state
//         const updatedCookies = { ...cookies };
//         delete updatedCookies.credentials;
//         setCookie(Object.keys(updatedCookies), Object.values(updatedCookies));
//     }
//     return (
//       <div>       
//         <p>You are already signed up</p> 
//         <p>Nickname: {user?.nickname || "demo"}</p>
//         <p>email: {user?.email}</p>
//         <p>password:{'*'.repeat(user?.password.length)}</p>
//         <div style={{display:"flex", flexDirection:"column"}} > 
//           <Link to={"/change-nickname"}>Want to change the nickname? Press here</Link>
//           <Link onClick={onDel} to={"/login"}>Want to leave the account? Press here</Link>
//         </div>
        
//       </div>
//     );
//   }
  
//   export default SignedUp;