import { useEffect, useState } from "react"
import goldStar from "./images/gold_star.png"
import greyStar from "./images/star_grey.png"
import "./index.css"

const UserRatingStars = ({ rating, onSave }) => {
    const [stars, setStars] = useState([]);
    useEffect(()=>{
        setStars(Array.from({ length: 10 }, (_, i) => (i < rating ? 1 : 0)));
    },[rating])
    function setRating(newRating){
        onSave(newRating)
    }
    return (
        <div className="starsContainer">
            {stars.map((e, index) => (
                <img onClick={()=>setRating(index+1)} key={index} src={e ? goldStar : greyStar} alt="Star" />
            ))}
        </div>
    );
};

export default UserRatingStars;