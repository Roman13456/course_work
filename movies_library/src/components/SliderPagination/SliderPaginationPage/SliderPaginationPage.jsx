import { useContext } from 'react';
import context from '../../shared/context/postsCtx';
import './index.css';
function SliderPaginationPage({num, trigger, center}) {
    const {onsetPage} = useContext(context);

  return (
        <button onClick={()=>{
            console.log()
            onsetPage(num-1)
        }} className={`${center?"activePage":""}`}>{trigger?"...":num}</button>
  );
}

export default SliderPaginationPage;