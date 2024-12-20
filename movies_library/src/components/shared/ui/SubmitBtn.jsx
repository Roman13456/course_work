import { useFormikContext } from "formik"
import Button from '@mui/material/Button';
const SubmitBtn = ({text, disabled=false})=>{
    const formikCtx = useFormikContext()
    return (
        <Button variant="contained" type="submit" disabled={!formikCtx.isValid || formikCtx.isSubmitting || disabled}>{text}</Button>
    )
}
export default SubmitBtn