import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, Outlet, useLocation, useNavigate, } from 'react-router-dom'; 
import queryString from 'query-string';  // For constructing query strings
import { Formik, Form, Field } from 'formik';  // Import Formik components
import TextfieldWrapper from '../formsUI/TextfieldWrapper';
import SubmitBtn from '../shared/ui/SubmitBtn';
import "./index.css"
import searchIcon from "./search.png"

function Navigation(){
    const location = useLocation()
    // const querySearchString = queryString.parse(location.search);
    const [searchQuery, setSearchQuery] = useState("");
    const navigate = useNavigate();
    
    
    const handleSearchSubmit = (values) => {
        // Construct query parameters
        const queryParams = queryString.stringify({
          query: values.searchQuery,
          page: 1,
          sortOrder: '', // or 'DESC'
          sortParameter: '' // or 'vote_count'
        });
        // Check if the current route is /movies/search
        if (location.pathname === '/movies/search') {
          if(values.searchQuery){
            navigate(`/movies/search?${queryParams}`);
          }else{
            navigate(`/movies?`);
          }
          
        }else if(location.pathname.match("/adminpanel")) {
          if(values.searchQuery){
            navigate(`/adminpanel?${queryParams}`);//, { replace: true }
          }else{
            //if user query is empty just get back to /adminpanel
            navigate(`/adminpanel`)
          }
        }
        else {
          // Otherwise, navigate to /movies/search with new query params
            navigate(`/movies/search?${queryParams}`);
        }
      };

      useEffect(() => {
        if (location.pathname === '/movies/search') {
            const querySearchString = queryString.parse(location.search);
            setSearchQuery(querySearchString.query || "");  // Set the search query from the URL
            if(!querySearchString.query) navigate(`/movies`)
          }else if(location.pathname === '/adminpanel'){
            
            // console.log("location.pathname", location.pathname)
            const querySearchString = queryString.parse(location.search);
            setSearchQuery(querySearchString.query || "");  // Set the search query from the URL
          }
          // else if(location.pathname==="/reccomendations/personalized"){
          //   const querySearchString = queryString.parse(location.search);
          //   // console.log("querySearchString",querySearchString,location)
          //   setSearchQuery(querySearchString.query || "");  // Set the search query from the URL
          // }
          else {
            // Reset search query if navigating away from /movies/search
            setSearchQuery("");
          }
        }, [location.search, location.pathname, navigate]);

    const {isAuthenticated, loading, details} = useSelector((state) => state.user);
    return(
        <>
            <nav>
               <div style={{display:'flex', justifyContent:'center', gap:'10px'}}>
                    {/* <Link to='/'>About</Link>
                    <Link to='/movies'>Movies</Link> */}
                    {/* <Link to='/images'>Images</Link>
                    {user?.admin?<Link to='/imageCustomization/creation'>Create Image</Link>:""} */}
                    {/* {!loading&&(isAuthenticated?
                    <>
                      <Link to='/reccomendations/personalized'>Reccomendations</Link>
                      <Link to='/signedup'>Profile</Link>
                    </>: 
                    <>
                        <Link to='/login'>Login</Link>
                        <Link to='/signup'>Sign-Up</Link>
                    </>)} */}
                    {/* {details?.admin && <Link to='/adminpanel'>Admin-panel</Link>} */}
               </div>
                
              {(location.pathname === '/movies/search' ||  
              location.pathname === '/movies' || 
              location.pathname.match("\/movie\/[0-9]+") ||
              location.pathname.match("/adminpanel") ||
              location.pathname.match("/favorites") ||
              location.pathname.match("/recommendations/personalized"))&&
              <Formik 
                    enableReinitialize={true}  // Enable reinitialization when initialValues change
                    initialValues={{ searchQuery }}  // Initial search input value
                    onSubmit={(values, { setSubmitting }) => {
                    handleSearchSubmit(values);
                    setSubmitting(false);  // Reset form submission state
                  }}
                >
                  {({ isSubmitting }) => (
                    <Form className='searchForm'>
                      <div style={{ height: "40px"}}>
                        <TextfieldWrapper
                          name="searchQuery"  // Field name managed by Formik
                          placeholder="Search movies..."  // Placeholder for search input
                        />
                      </div>
                      <SubmitBtn text={<img src={searchIcon} alt='search icon'></img>} disabled={isSubmitting} />
                    </Form>
                  )}
                </Formik>
              }
            </nav>
            <Outlet/>
        </>
        
    )
}
export default Navigation