import { Formik, Field, ErrorMessage, Form} from "formik";
import TextfieldWrapper from "../../../formsUI/TextfieldWrapper";
import SubmitBtn from "../../../shared/ui/SubmintBtn";
import * as yup from 'yup'
// import { registerUser } from "../registryApi";
// import { useCookies } from "react-cookie";
// import SignedUp from "../SignedUp/SignedUp";
import { useState } from "react";
import "../../index.css"
import SpinnerVar from "../../../Spinner/Spinner";
import { changeNickname } from "../../registryApi";
import { useDispatch, useSelector } from "react-redux";
import { setUserName} from "../../../../store/reducers/user.reducers"
function ChangeNickname() {
    // const [cookies, setCookie] = useCookies(['credentials']);
    const [spin,setSpin] = useState(false)
    const [result, setResult] = useState(false)
    const [msg, setMsg] = useState("")
    const user = useSelector((state) => state.USER);

    const initialValues = {
        nickname:"",
    }
    const dispatch = useDispatch()
    const nicknameSchema = yup.object().shape({
        nickname: yup
          .string()
          .trim()
          .min(4, 'Nickname must be at least 4 characters long')
          .max(20, 'Nickname must be less than 20 characters long')
          .matches(/^[a-zA-Z0-9_]+$/, 'Nickname can only contain letters, numbers, and underscores')
          .required('Nickname is required'),
      });
    async function onSave({nickname},{ setSubmitting, setErrors }){
        setSpin(true)
        const {data} = await changeNickname({email:user.email,nickname})
        setSpin(false);
        if (!data.success){
            setErrors({ nickname: data.message });
        }else{
            setResult(true)
            dispatch(setUserName(nickname))
            setMsg(data.message)
        }
    }
    return (
      <div className="loginForm">
            <p className="formTitle">Change nickname form</p>
            {user?<Formik
                initialValues={initialValues}
                onSubmit={onSave}
                enableReinitialize={true}
                validationSchema={nicknameSchema}
                >
                {   <Form>
                    <div className="formContainerInputs">
                        <div className="spinerAndInputContainerPositioned" >
                            {spin?<SpinnerVar width={"60px"} height={"60px"}/>:""}
                            {msg?<div style={{position:"absolute", margin:"auto", inset:0, maxWidth:"fit-content", maxHeight:"fit-content"}}>{msg}</div>:""}
                            {<>
                                <div className={`${spin || result?"hideContents":""}`}><p >Enter new nickname:</p>{/*the form is d-none when*/}
                                    <div>
                                        <TextfieldWrapper style={{display:"block"}} name="nickname"/>
                                    </div>
                                    <SubmitBtn text={"submit"} />
                                </div>    
                            </>}
                        </div>
                    </div>
                    </Form>
                }
            </Formik>:"You are not logged in"}
      </div>
    );
  }
  
  export default ChangeNickname;