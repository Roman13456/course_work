

import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux";
import "./UserFavorites.css"
import { Button } from "@mui/material";
import { removeFavorite } from "../../redux/slices/favoritesSlice";
import { useNavigate } from "react-router-dom";

const UserFavorites = ({isFavorite, onSave }) => {
    const [state, setState] = useState(isFavorite);

    const [onDeleteWait, setOnDeleteWait] = useState([])
    // useEffect(()=>{
    //     setStars(Array.from({ length: 10 }, (_, i) => (i < rating ? 1 : 0)));
    // },[rating])
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const { list:favorites, loading:favoritesLoading , ondeleteLoading} = useSelector((state) => state.favorites);
    const {isAuthenticated, error:UserError, loading: userLoading} 
  = useSelector((state) => state.user);


    function removeFromFavorites (id) {
        dispatch(removeFavorite(id))
    };

    if(userLoading){
        return <p className='movieListMessage'>Loading user...</p>;
      }
    
    if(UserError){
        return <p className='movieListMessage'>Error fetching user: {UserError}</p>;
    }

    if (!isAuthenticated) {
        return <p className='movieListMessage'>
            Users who aren’t signed in can’t access the favorites page
        </p>;
    }

    if(favoritesLoading){
        return <p className='movieListMessage'>Loading favorite movies...</p>;
    }

    if(favorites?.length===0){
        return <p className='movieListMessage'>No favorite movies added yet</p>;
    }

    

    return (
        <div className="favoritesContainer">
            <h2>Favorites</h2>
            {favorites.length && favorites.map((favmovie,idx)=>(
                <div key={idx} className="favoritesItem" onClick={()=>navigate(`/movie/${favmovie.id}`)}>
                    <img src={favmovie.image[0]==="/"?
                        'https://image.tmdb.org/t/p/w500'+favmovie.image:favmovie.image

                    } alt={`title of ${favmovie.title} movie`}/>
                    <div className="favoritesDetails">
                        <div className="desc">
                            <h3>
                                {favmovie.title}
                            </h3>
                            <p >
                                {favmovie.description}
                            </p>
                        </div>
                        <Button variant="contained" color="warning"  
                        onClick={(event)=>{
                            // e.preventDefault()
                            event.stopPropagation()
                            setOnDeleteWait([...onDeleteWait, favmovie.id])
                            removeFromFavorites(favmovie.id)
                        }}>
                            {onDeleteWait.includes(favmovie.id) && ondeleteLoading ?
                            "deleting...":"delete"}
                           
                        </Button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default UserFavorites;

