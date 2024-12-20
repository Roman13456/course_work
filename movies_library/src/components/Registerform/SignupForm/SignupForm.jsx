import { Formik, Form } from "formik";
import { Link } from "react-router-dom";
import TextfieldWrapper from "../../formsUI/TextfieldWrapper";
import SubmitBtn from "../../shared/ui/SubmitBtn";
import * as yup from 'yup';
import { useDispatch, useSelector } from "react-redux";
import { registerUserThunk } from "../../../redux/thunks/userThunks";
import "../index.css";
import { useEffect } from "react";
import { resetResponse } from "../../../redux/slices/userSlice";

function SignUpForm() {
  const dispatch = useDispatch();
  const {loading, error, response, isAuthenticated, noConnection} = useSelector((state) => state.user);  // Access Redux state
  
  const initialValues = {
    email: "",
    password: "",
    confirmPassword: "",
  };

  const validationSchema = yup.object().shape({
    email: yup.string().email("Invalid email").required("Email is required"),
    password: yup.string()
      .required("Password is required")
      .min(8, "Password must be at least 8 characters")
      .max(20, "Password cannot exceed 20 characters")
      .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
      .matches(/\d/, "Password must contain at least one number")
      .matches(/[@$!%*?&#]/, "Password must contain at least one special character"),
    confirmPassword: yup.string()
      .oneOf([yup.ref('password'), null], 'Passwords must match')
      .required("Please confirm your password"),
  });

  const onSave = async (values, { setSubmitting, setErrors }) => {
    setSubmitting(true);
    // values={email: 'yevican931@regishub.com', password: "Rtx3070ti@"}
    const resultAction = await dispatch(registerUserThunk({ email: values.email, password: values.password }));
    if(registerUserThunk.rejected.match(resultAction) && !noConnection){
      const {email} = resultAction.payload.errors
      if (email){
        setErrors({email}); // Set error message in Formik
      }
  }
    setSubmitting(false);
  };
  useEffect(()=>{
    dispatch(resetResponse())
  },[dispatch])

  return (
    <div className="loginForm signupForm">
      <p className="formTitle">Sign-up Form</p>
      <Formik
        initialValues={initialValues}
        onSubmit={onSave}
        validationSchema={validationSchema}
        validateOnBlur={true}  // Validate on focus out
        validateOnChange={false}  // Disable validation while typing
      >
        {({ isSubmitting }) => (
          <Form>
            <div className="formContainerInputs">
              {loading? <p className="formTitle message">Loading...</p>:(
                noConnection?<p className="formTitle message">{error}</p>:
                (isAuthenticated? 
                  <p className="formTitle message">You are already logged in</p>:
                  (response && !error?<p className="formTitle message">{response}</p>:
                    <>
                      <div>
                        <p>Enter Email:</p>
                        <TextfieldWrapper name="email" />
                      </div>
                      <div>
                        <p>Enter Password:</p>
                        <TextfieldWrapper name="password" type="password" />
                      </div>
                      <div>
                        <p>Confirm Password:</p>
                        <TextfieldWrapper name="confirmPassword" type="password" />
                      </div>
                      <SubmitBtn text={loading ? "Loading..." : "Submit"} disabled={isSubmitting || loading} />
                    </>
                  )
                )
              )}
            </div>
          </Form>
        )}
      </Formik>
      {loading || isAuthenticated?<p></p>: <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap" }}>
        <Link to="/login">Are you signed-up? Log in</Link>
        {/* <Link to="/email-confirm">Forgot password? Click here</Link> */}
      </div>}
      
    </div>
  );
}

export default SignUpForm;