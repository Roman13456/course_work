import { useEffect, useState } from "react"
import redHeart from "./images/red-heart.png"
import greyHeart from "./images/grey-heart.png"
import hoveredHeart from "./images/heartHover.png"
import "./Heart.css"

const ChangeFavorites = ({isFavorite, onSave, access}) => {
    const [state, setState] = useState(isFavorite);
    const [isHovered, setIsHovered] = useState(false);
    const handleFavoriteClick = () => {
        const newFavoriteState = !state;
        onSave(newFavoriteState); // Pass the new state to onSave
        if(access){
            setState(newFavoriteState); // Toggle favorite state
        }
    };


    return (
        <div className={`FavoritesChangerContainer`} onClick={handleFavoriteClick}>
            <img src={isHovered && !state?hoveredHeart:(
                state?redHeart:greyHeart
            )}  
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            alt={state?"in favorites":"not in favorites"}/>
        </div>
    );
};

export default ChangeFavorites;