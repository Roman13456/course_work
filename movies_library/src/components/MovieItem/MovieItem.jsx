import './MovieListItem.css';
import { useNavigate } from 'react-router-dom';



function MovieItem({movie}){
    const navigate = useNavigate();
    // console.log("(MovieItem)movie",movie)

    function NavToMoviePage(id){
      navigate(`/movie/${id}`)
    }
    return (
        <div key={movie.id} onClick={()=>NavToMoviePage(movie.id)} className="movie-item">
              <img src={movie.image[0]==="/"? 'https://image.tmdb.org/t/p/w500'+movie.image:movie.image} alt={movie.title} className="movie-poster" />
              <div className="movie-details">
                <h3>{movie.title}</h3>
                <p className='desc'>{movie.description}</p>
                <p>Genres: {movie.genre.replaceAll(",", ", ")}</p>
                {/* <p>Popularity: {movie.popularity}</p> */}
                <p>Vote Average: {Number(movie.vote_average).toFixed(2)}</p>
              </div>
            </div>
    )
}
export default MovieItem;