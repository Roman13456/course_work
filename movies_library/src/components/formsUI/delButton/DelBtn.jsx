import delPng from './del.png'
import "./index.css"
function DelBtn({onDel}){
    return (
    <button onClick={onDel} className='deleteBtn' type='button'>
        <img alt="" src={delPng}></img>
    </button>    
    )
}
export default DelBtn