

import { Formik, Form,  ErrorMessage } from "formik";
import { Link,useNavigate } from "react-router-dom";
import TextfieldWrapper from "../formsUI/TextfieldWrapper";
import SubmitBtn from "../shared/ui/SubmitBtn";
import * as yup from 'yup';
import { useDispatch, useSelector } from "react-redux";
import { loginUserThunk } from "../../redux/thunks/userThunks";
import "./index.css";
import { useEffect } from 'react';
import { resetResponse} from "../../redux/slices/userSlice";

function LoginForm() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, noConnection, token, isAuthenticated } = useSelector((state) => state.user);  // Access Redux state
  
  useEffect(()=>{
    dispatch(resetResponse())
  }, [])

  // useEffect(()=>{
  //   if(error) dispatch(resetError())
  // }, [error, dispatch])

  const initialValues = {
    email: "",
    password: "",
  };

  const validationSchema = yup.object().shape({
    email: yup.string().email("Invalid email").required("Email is required"),
    password: yup.string().required("Password is required")
    .min(8, "Password must be at least 8 characters")
    .max(20, "Password cannot exceed 20 characters"),
  });


  const onSave = async (values, { setSubmitting, setErrors}) => {
    setSubmitting(true);
    // Dispatch the loginUserThunk with form values
    const resultAction = await dispatch(loginUserThunk({ email: values.email, password: values.password }));
    // Check if the action was successful (fulfilled)
    if (loginUserThunk.fulfilled.match(resultAction)) {
        // Navigate to the desired page if successful
        navigate('/signedup');
    }else if(loginUserThunk.rejected.match(resultAction)){
        const {email,password} = resultAction.payload.errors
        if (email){
          setErrors({email}); // Set error message in Formik
        }
        if(password){
          setErrors({password});
        }
        
    }
    setSubmitting(false);
  };

  useEffect(()=>{
    if(isAuthenticated){
      navigate('/signedup');
    }
  },[isAuthenticated, navigate])

  // Store the token in localStorage after a successful login
  
 

  return (
    <div className="loginForm">
      <p className="formTitle">Login Form</p>
      <Formik
        initialValues={initialValues}
        onSubmit={onSave}
        validationSchema={validationSchema}
        validateOnBlur={true}  // Validate on focus out
        validateOnChange={false}  // Disable validation while typing <SignedUp/>
      >
        {({ isSubmitting }) => (
          <Form>
            <div className="formContainerInputs">
            {loading || isAuthenticated?<p className="formTitle message">Loading...</p>:
            (noConnection?
              <p className="formTitle message">{error}</p>:
              <>
                  <div>
                      <p>Enter Email:</p>
                      <TextfieldWrapper name="email" />
                  </div>
                  <div>
                      <p>Enter Password:</p>
                      <TextfieldWrapper name="password" type="password"/>
                  </div>
                  <SubmitBtn text="Submit" disabled={isSubmitting || loading} />
              </>
            )}
            </div>
          </Form>
        )}
      </Formik>
      {loading || isAuthenticated?<p></p>: <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap" }}>
        <Link to="/signup">Don't have an account? Sign up</Link>
        <Link to="/reset-password">Forgot password? Click here</Link>
      </div>}
    </div>
  );
}

export default LoginForm;










// import { Formik, Field, ErrorMessage, Form} from "formik";
// import { Link } from "react-router-dom";
// import TextfieldWrapper from "../formsUI/TextfieldWrapper";
// import SubmitBtn from "../shared/ui/SubmintBtn";
// import * as yup from 'yup'
// import "./index.css"
// import { useCookies } from 'react-cookie';
// import { checkCredentials } from "./registryApi";
// import SignedUp from "./SignedUp/SignedUp";
// import { useDispatch } from "react-redux";
// import { setUser } from "../../store/reducers/user.reducers";
// function RegisterForm() {
//     const [cookies, setCookie] = useCookies(['credentials']);
//     const initialValues = {
//         email:"",
//         password:"",
//     }
//     const todoSchema = yup.object().shape({
//         email: yup.string().email().required(),
//         password: yup.string().required().min(8).max(20),
//       });
//       const dispatch = useDispatch()
//     async function onSave({email, password}, { setSubmitting, setErrors }){
//         const {data} = await checkCredentials({email, password})
//         if(data.success){
//             const expirationDate = new Date();
//             expirationDate.setDate(expirationDate.getDate() + 7);
//             dispatch(setUser(data.obj))
//             await setCookie('credentials', { email, password, }, { path: '/', expires: expirationDate });
//         }else{
//             if(data.message==='Invalid password'){
//                 setErrors({ password: data.message });
//             }else if(data.message==='Invalid email'){
//                 setErrors({ email: data.message });
//             }
//         }
//     }
//     console.log(cookies.credentials)
//     return (
//       <div className="loginForm">
//         <p className="formTitle">Log-in form</p>
//         {!cookies.credentials?<><Formik
//                 initialValues={initialValues}
//                 onSubmit={onSave}
//                 enableReinitialize={true}
//                 validationSchema={todoSchema}
//                 // validate={validate}
//                 >
//                 {   <Form>
//                     <div className="formContainerInputs" style={{}}>
//                     <div>
//                                 <div className="">
//                                     <p >Enter login:</p>
//                                     <div>
//                                         <TextfieldWrapper style={{display:"block"}} name="email"/>
//                                     </div>
//                                     <p>Enter password:</p>
//                                     <div>
//                                         <TextfieldWrapper style={{display:"block"}} name="password"/>
//                                     </div>
//                                     <SubmitBtn text={"submit"} />
//                                 </div>
//                             </div>
//                             <div>
//                             </div>
//                     </div>
                            
                        
//                     </Form>
//                 }
//             </Formik>
//             <div style={{display:"flex", justifyContent:"space-between", flexWrap:"wrap"}}>
//                 <Link to={"/signup"} style={{padding:"0 30px 20px 0"}}>Are you new here? Sign up</Link>
//                 <Link to={"/email-confirm"}>Forgot password? Click here</Link>
//             </div>
//             </>:<SignedUp></SignedUp>}
        
        
//       </div>
//     );
//   }
  
//   export default RegisterForm;