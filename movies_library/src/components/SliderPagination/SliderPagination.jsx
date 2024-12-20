// import PreviewList from './components/previewList/PreviewList';
// import NotFound from './components/NotFound/NotFound';
// import Navigation from './components/Navigation/Navigation';
// import ImagePage from './components/ImagePage/ImagePage';
// import {Route, Routes} from 'react-router-dom';
// import ItemCustomization from './components/ItemCustomization/ItemCustomization';
// import RegisterForm from './components/Registerform/RegisterForm';
// import SignupForm from './components/Registerform/SignupForm/SignupForm';
// import { useEffect } from 'react';
// import { useCookies } from 'react-cookie';
// import { checkCredentials } from './components/Registerform/registryApi';
// import { setUser } from './store/reducers/user.reducers';
// import { useDispatch, useSelector } from 'react-redux';
import './index.css';
import SliderPaginationPage from "./SliderPaginationPage/SliderPaginationPage";
import context from "../shared/context/postsCtx";
function SliderPagination({page,onsetPage,totalPages}) {
  let lim0 =  0
  let lim1 = 0
  let initpage = page+1;
  function distributeFreePages(){
    if(totalPages!==0){
      let trigger0 = 1
      let pages = totalPages-1>6?6:totalPages-1
      // console.log("current page is:", page+1)
      // let i = 0 
      while(pages>0){
        if(trigger0){
          trigger0=0
          if(initpage - 1-lim0>=1){
              pages-=1
              lim0+=1
          }
          // console.log(lim0,lim1)
        }else{
          trigger0=1
          if(totalPages- initpage-lim1>=1){
            pages-=1
            lim1+=1
          }
          // console.log(lim0,lim1)
        }
      }
      // console.log(lim0,lim1)
    }
  }
  distributeFreePages()
  let compsArray = [<SliderPaginationPage center={true} num={initpage} />]

  for(let i=0; i<lim0-1; i++){
    console.log("i:",i)
    initpage--   
    if(i+1===(lim0-1)&&page+1-lim0>1){
        compsArray.unshift(<SliderPaginationPage trigger={true} num={initpage} />)
    }else{
        compsArray.unshift(<SliderPaginationPage num={initpage} />)
    }
  }
  initpage = page+1;
  if(page+1!==1){
    compsArray.unshift(<SliderPaginationPage num={1} />)
  }
  for(let i=0; i<lim1-1; i++){
    initpage++
    if(i+1===(lim1-1)&&page+1+lim1<totalPages){
        compsArray.push(<SliderPaginationPage num={initpage} trigger={true}/>)
    }else{
        compsArray.push(<SliderPaginationPage num={initpage}/>)
    }
  }
  initpage = page+1;
  if(page+1!==totalPages){
    compsArray.push(<SliderPaginationPage num={totalPages} />)
  }
  
  return (
    <div style={{maxWidth:"1640px",margin:"auto",display: "flex", justifyContent:"center"}} className="paginationContainer">
        <context.Provider value={{page,onsetPage}}>
        {compsArray.map((component, index) =><div className='pageContainer' key={index}>{component}</div>)}
        {/* {count.map((e,idx)=><SliderPaginationPage idx={idx}/>)} */}
        </context.Provider>
    </div>
  );
}

export default SliderPagination;