import { Formik, Form } from "formik";
import * as yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import { resetPasswordThunk } from "../../../../redux/thunks/userThunks";
import TextfieldWrapper from "../../../formsUI/TextfieldWrapper";
import SubmitBtn from "../../../shared/ui/SubmitBtn";
import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { resetResponse } from "../../../../redux/slices/userSlice";

function ResetPassword() {
  const dispatch = useDispatch();
  const { loading, response, error, noConnection, isAuthenticated } = useSelector((state) => state.user);
  const { token } = useParams();  // Get token from URL params

  useEffect(() => {
    dispatch(resetResponse());  // Reset the response on component mount
  }, [dispatch]);

  const initialValues = {
    newPassword: "",
    confirmNewPassword: "",
  };

  const validationSchema = yup.object().shape({
    newPassword: yup
      .string()
      .required("Password is required")
      .min(8, "Password must be at least 8 characters")
      .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
      .matches(/\d/, "Password must contain at least one number")
      .matches(/[@$!%*?&#]/, "Password must contain at least one special character"),
    confirmNewPassword: yup
      .string()
      .oneOf([yup.ref("newPassword"), null], "Passwords must match")
      .required("Please confirm your password"),
  });

  const onSave = async (values, { setSubmitting }) => {
    setSubmitting(true);
    await dispatch(resetPasswordThunk({ token, newPassword: values.newPassword }));
    setSubmitting(false);
  };

  return (
    <div className="loginForm">
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
            {loading?<p className="formTitle message">Loading...</p>:(
              noConnection?<p className="formTitle message">{error}</p>:
              ( error?<p className="formTitle message">{error}</p>:(
                isAuthenticated?<p className="formTitle message">You are already logged in</p>:
                  (response? <p className="formTitle message">{response}</p>:
                    <div className="formContainerInputs">
                      <div>
                          <p>Enter New Password:</p>
                          <TextfieldWrapper name="newPassword" type="password" />
                      </div>
                      <div>
                          <p>Confirm New Password:</p>
                          <TextfieldWrapper name="confirmNewPassword" type="password" />
                      </div>
                      <SubmitBtn text={loading ? "Loading..." : "Submit"} disabled={isSubmitting || loading} />
                  </div>
                  )
                )
              )
            )}


            {/* {loading?<p className="formTitle message">Loading...</p>:
            (response?<p className="formTitle message">{response}</p>:(isAuthenticated?
                <p className="formTitle message">You are already logged in</p>:
                <div className="formContainerInputs">
                    <div>
                        <p>Enter New Password:</p>
                        <TextfieldWrapper name="newPassword" type="password" />
                    </div>
                    <div>
                        <p>Confirm New Password:</p>
                        <TextfieldWrapper name="confirmNewPassword" type="password" />
                    </div>
                    <SubmitBtn text={loading ? "Loading..." : "Submit"} disabled={isSubmitting || loading} />
                </div>
            ))} */}
            
            {/* {response && <p className="serverMessage">{response}</p>}
            {error && <p className="errorMessage">{error}</p>} */}
          </Form>
        )}
      </Formik>
        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", marginTop: '20px' }}>
              {loading || isAuthenticated?<p></p>:
              <>
                <Link to="/login">Are you signed-up? Log in</Link>
                <Link to="/signup">Don't have an account? Sign up</Link>
              </>}
              
        </div>
    </div>
  );
}

export default ResetPassword;







// import { Formik, Field, ErrorMessage, Form} from "formik";
// import { Link, useNavigate, useParams } from "react-router-dom";
// import TextfieldWrapper from "../../../formsUI/TextfieldWrapper";
// import SubmitBtn from "../../../shared/ui/SubmitBtn";
// import * as yup from 'yup'
// // import { registerUser } from "../registryApi";
// import { useCookies } from "react-cookie";
// import SignedUp from "../../SignedUp/SignedUp";
// import { useState } from "react";
// import "../../index.css"
// import SpinnerVar from "../../../Spinner/Spinner";
// import { useEffect } from "react";
// import { changePassword, checkToken } from "../../registryApi";
// // import { resetPassword } from "../registryApi";

// function ResetPassword() {
//     const { token} = useParams()
//     const [cookies, setCookie] = useCookies(['credentials']);
//     const [spin,setSpin] = useState(true)
//     const [result, setResult] = useState(false)
//     const [msg, setMsg] = useState("")
//     const initialValues = {
//         password:"",
//         password1:""
//     }
//     useEffect(()=>{
//         async function tokenCheck(){
//             const {data} = await checkToken(token)
//             if(data.success){
//                 setResult(true)
//             }else{
//                 setResult(false)
//                 setMsg(data.message)
//             }
//             setSpin(false)
//         } 
//         tokenCheck()
        
//     },[])
    
//     const todoSchema = yup.object().shape({
//         password: yup.string().required().min(8).max(20),
//         password1:yup.string().required().min(8).max(20)
//       });
//     async function onSave({password, password1},{ setSubmitting, setErrors }){
//         if(password!==password1){
//             setErrors({ password1: "Passwords don't match" });
//         }else{
//             //...
//             setSpin(true)
//             const {data} = await changePassword(token,password)
//             setSpin(false)
//             if(!data.success){
//                 setMsg(data.message)
//             }else{
//                 setMsg("Password has been changed successfully")
//             }
            
//             setResult(false)
//         }
//     }
//     return (
//       <div className="loginForm">
        
//         {!cookies.credentials?(<>
//             <>
//             <p className="formTitle">Email confirmation form</p>
//             {<Formik
//                 initialValues={initialValues}
//                 onSubmit={onSave}
//                 enableReinitialize={true}
//                 validationSchema={todoSchema}
//                 // validate={validate}
//                 >
//                 {   <Form>
//                     <div className="formContainerInputs">
//                         <div className="spinerAndInputContainerPositioned">
//                             {spin?<SpinnerVar width={"60px"} height={"60px"}/>:""}
//                             {<>
//                                 {msg&&!spin?<div style={{position:"absolute", margin:"auto", inset:0, maxWidth:"fit-content", maxHeight:"fit-content"}}>{msg}</div>:""}
//                                 <div className={`${spin||!result?"hideContents":""}`}>
//                                     <p >Enter new password:</p>
//                                     <div>
//                                         <TextfieldWrapper style={{display:"block"}} name="password"/>
//                                     </div>
//                                     <p >Repeat new password:</p>
//                                     <div>
//                                         <TextfieldWrapper style={{display:"block"}} name="password1"/>
//                                     </div>
//                                     <SubmitBtn text={"submit"} />
//                                 </div>    
//                             </>}
//                         </div>
//                     </div>
                            
                        
//                     </Form>
//                 }
//             </Formik>}
//             <Link to={"/login"}>Already signed up? Log in</Link></>
            
//         </>):<SignedUp></SignedUp>}
//       </div>
//     );
//   }
  
//   export default ResetPassword;