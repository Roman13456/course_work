import { Formik, Form } from "formik";
import * as yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import { requestPasswordResetThunk } from "../../../redux/thunks/userThunks";
import TextfieldWrapper from "../../formsUI/TextfieldWrapper";
import SubmitBtn from "../../shared/ui/SubmitBtn";
import { useEffect } from "react";
import { resetResponse } from "../../../redux/slices/userSlice";
import { Link } from "react-router-dom";

function EmailConfirmation() {
  const dispatch = useDispatch();
  const { loading, error, response, isAuthenticated, noConnection} = useSelector((state) => state.user);

  useEffect(() => {
    dispatch(resetResponse());
  }, [dispatch]);

  const initialValues = {
    email: "",
  };

  const validationSchema = yup.object().shape({
    email: yup
      .string()
      .email("Invalid email")
      .required("Email is required"),
  });

  const onSave = async (values, { setSubmitting ,setErrors}) => {
    setSubmitting(true);
    const resultAction = await dispatch(requestPasswordResetThunk({ email: values.email }));
    if(requestPasswordResetThunk.rejected.match(resultAction) && !noConnection){
      const {email} = resultAction.payload.errors
      if (email){
        setErrors({email}); // Set error message in Formik
      }
    }
    setSubmitting(false);
  };

  return (
    <div className="loginForm emailConfirm">
      <p className="formTitle">Reset Password</p>
      <Formik
        initialValues={initialValues}
        onSubmit={onSave}
        validationSchema={validationSchema}
        validateOnBlur={true}
        validateOnChange={false}
      >
        {({ isSubmitting }) => (
          <Form>
            {loading?<p className="formTitle message">Loading...</p>:
            (noConnection?<p className="formTitle message">{error}</p>:
            (
              isAuthenticated?<p className="formTitle message">You are already logged in</p>:
              (response && !error? <p className="formTitle message">{response}</p>:
              <div className="formContainerInputs">
                <div>
                    <p>Enter Email:</p>
                    <TextfieldWrapper name="email" />
                </div>
                <SubmitBtn text={"Submit"}
                    disabled={isSubmitting || loading}/>            
              </div>)
            ))}
          </Form>
        )}
      </Formik>
      {loading || isAuthenticated?<p></p>:<Link to="/login">Log in</Link>}
    </div>
  );
}

export default EmailConfirmation;











// import { Formik, Field, ErrorMessage, Form} from "formik";
// import { Link, useNavigate } from "react-router-dom";
// import TextfieldWrapper from "../../formsUI/TextfieldWrapper";
// import SubmitBtn from "../../shared/ui/SubmitBtn";
// import * as yup from 'yup'
// // import { registerUser } from "../registryApi";
// import { useCookies } from "react-cookie";
// import SignedUp from "../SignedUp/SignedUp";
// import { useState } from "react";
// import "../index.css"
// import SpinnerVar from "../../Spinner/Spinner";
// import { resetPassword } from "../registryApi";

// function EmailConfirmation() {
//     const [cookies, setCookie] = useCookies(['credentials']);
//     const [spin,setSpin] = useState(false)
//     const [result, setResult] = useState(false)
//     const [msg, setMsg] = useState("")


//     const initialValues = {
//         email:"",
//     }
    
//     const todoSchema = yup.object().shape({
//         email: yup.string().email().required(),
//       });
//     async function onSave({email},{ setSubmitting, setErrors }){
//         setSpin(true)
//         const {data} = await resetPassword(email)
//         setResult(true)
//         setSpin(false);
//         setMsg(data.message)
//         console.log(data)
//     }
//     return (
//       <div className="loginForm">
        
//         {!cookies.credentials?(<>
//             <>
//             <p className="formTitle">Email confirmation form</p>
//             <Formik
//                 initialValues={initialValues}
//                 onSubmit={onSave}
//                 enableReinitialize={true}
//                 validationSchema={todoSchema}
//                 >
//                 {   <Form>
//                     <div className="formContainerInputs">
//                         <div className="spinerAndInputContainerPositioned" >
//                             {spin?<SpinnerVar width={"60px"} height={"60px"}/>:""}
//                             {msg?<div style={{position:"absolute", margin:"auto", inset:0, maxWidth:"fit-content", maxHeight:"fit-content"}}>{msg}</div>:""}
//                             {<>
//                                 <div className={`${spin||result?"hideContents":""}`}><p >Enter your email:</p>
//                                     <div>
//                                         <TextfieldWrapper style={{display:"block"}} name="email"/>
//                                     </div>
//                                     <SubmitBtn text={"submit"} />
//                                 </div>    
//                             </>}
//                         </div>
//                     </div>
                            
                        
//                     </Form>
//                 }
//             </Formik>
//             <Link to={"/login"}>Already signed up? Log in</Link></>
            
//         </>):<SignedUp></SignedUp>}
//       </div>
//     );
//   }
  
//   export default EmailConfirmation;