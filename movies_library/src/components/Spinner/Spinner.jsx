import Spinner from 'react-bootstrap/Spinner';
import 'bootstrap/dist/css/bootstrap.min.css';


function SpinnerVar({height,width}) {
  return (
    <div style={{position:"absolute", inset:0, margin:"auto", zIndex:1}}>
        <div style={{position:"relative", height:"100%"}}>
            <Spinner style={{position:"absolute", margin:"auto", inset:0,height,width}} animation="border" role="status">
                <span  className="visually-hidden">Loading...</span>
            </Spinner>
        </div>
    </div>
    
    
  );
}

export default SpinnerVar;