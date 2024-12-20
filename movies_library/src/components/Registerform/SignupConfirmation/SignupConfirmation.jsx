import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { confirmRegistrationThunk } from '../../../redux/thunks/userThunks';
import "../index.css";  // Use the same CSS as the RegisterForm
import { resetResponse } from '../../../redux/slices/userSlice';

function SignupConfirmation() {
  const { token } = useParams();
  const dispatch = useDispatch();
  const {response, loading, error, noConnection, isAuthenticated} = useSelector((state) => state.user);  // Assuming `loading` and `error` are part of your user slice

  useEffect(() => {
    dispatch(confirmRegistrationThunk(token))
  }, [dispatch, token]);
  useEffect(()=>{
    dispatch(resetResponse())
  },[])
  return (
    <div className="loginForm">
      <p className="formTitle">Email Confirmation</p>
      <div className="formContainerInputs">
        {loading ? <p className="formTitle message">Loading...</p>:(
          noConnection || error?<p className="formTitle message">{error}</p>:
          (response?<p className="formTitle message">{response}</p>:"Placeholder")
        )}
      </div>
      {loading || isAuthenticated?<p></p>: 
      <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap" }}>
        <Link to="/signup">Sign up</Link>
        <Link to="/login">Log in</Link>
      </div>}
    </div>
  );
}

export default SignupConfirmation;

