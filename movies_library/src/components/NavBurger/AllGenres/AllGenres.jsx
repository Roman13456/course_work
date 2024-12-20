import "./AllGenres.css"
import { useLocation, useNavigate } from "react-router-dom"
import { forwardRef, useEffect, useState } from "react";
import moviesApi from "../../../api/moviesApi"
import queryString from 'query-string';  // For parsing and constructing query strings

const AllGenres = forwardRef(function AllGenres({state, onSetState}, ref){
    const [genres, setGenres] = useState([]);
    
    const location = useLocation()
    const navigate = useNavigate();  // Add useNavigate hook

    useEffect(()=>{
        onSetState(false)
    },[location.pathname, location.search])

    // Fetch genres on component mount
    useEffect(() => {
        async function getGenres() {
            const { data } = await moviesApi.getGenres();
            const genreOptions = data.data.map(genre => ({
                label: genre.name,
                value: genre.id
            }));
            setGenres(genreOptions);
        }
        getGenres();
    }, []);

    // Function to update the query string with the selected genre
    const handleGenreClick = (label) => {
        const fetchParams = {
        page: 1, 
        limit: 12,
        genre:label
        };

        // Build the new query string
        const newQueryString = queryString.stringify(fetchParams);
        // Navigate to the current path with the updated query string
        navigate(`/movies?${newQueryString}`);
    };
    
    return(
        <div ref={ref} className={`allGenres ${state?"disabled":""}`} onClick={()=>onSetState(!state)}>
            <h5>Genres</h5>
            {state &&
            <div className="genresContainer">
            {genres.map(({label,value})=>(
                <div className="genreItem" key={value}>
                    <p onClick={()=>handleGenreClick(label)} to="#">{label}</p>
                </div>
            ))}
            </div>}
            
            
        </div>
        
        
    )
}) 

export default AllGenres

