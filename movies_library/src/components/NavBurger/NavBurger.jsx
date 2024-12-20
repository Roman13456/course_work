import menuIco from "./menu.png"
import crossIco from "./cross.png"
import "./navBurger.css"
import Navigation from "../Navigation/Navigation"
import { Link, useLocation } from "react-router-dom"
import { useSelector } from "react-redux";
import { useEffect, useRef, useState } from "react";
import AllGenres from "./AllGenres/AllGenres"

function NavBurger(){
    const {isAuthenticated, loading, details} = useSelector((state) => state.user);
    const [stateBurger, setStateBurger] = useState(false)
    const [stateGenresList, setStateGenresList] = useState(false)
    const location = useLocation()
    useEffect(()=>{
        setStateBurger(false)
    },[location.pathname,location.search])


    const genresRef = useRef(null); // Reference for the component
    const burgerRef = useRef(null); // Reference for the component
    useEffect(() => {
        const handleClickOutside = (event) => {
          if (burgerRef.current && !burgerRef.current.contains(event.target)) {
            setStateBurger(false)
          }
          if (genresRef.current && !genresRef.current.contains(event.target)) {
            setStateGenresList(false)
          }
        };
    
        // Add event listener when component mounts
        document.addEventListener('mousedown', handleClickOutside);
    
        // Clean up the event listener when the component unmounts
        return () => {
          document.removeEventListener('mousedown', handleClickOutside);
        };
      }, []);

    
    return(
        <div className="navigation">
            
            <div className={`navBurger ${stateBurger ? "disabled":""}`} tabIndex="0" 
                onClick={()=>setStateBurger(true)}>
                <img src={menuIco} className="menuIcon" alt="menu icon"/>
                <div className={`list ${!stateBurger ? "disabled":""}`}
                ref={burgerRef}>
                    <div className="container">
                        <button type="button" onClick={(e) => {
                            e.stopPropagation(); // Prevents the event from bubbling up
                            setStateBurger(false);
                        }}>
                            <img className="crossIco" src={crossIco} alt="close menu"/>
                        </button>
                        {/* <Link to='/'>About</Link> */}
                        <div className="LinkWrapper">
                            <Link to='/movies'>Movies</Link>
                        </div>
                        
                        
                        {!loading&&(isAuthenticated?
                        <>
                            <div className="LinkWrapper">
                                <Link to='/recommendations/personalized'>Recommendations</Link>
                            </div>
                            <div className="LinkWrapper">
                                <Link to='/signedup'>Profile</Link>
                            </div>
                            <div className="LinkWrapper">
                                <Link to='/favorites'>Favorites</Link>
                            </div>
                        </>: 
                        <>
                            <div className="LinkWrapper">
                                <Link to='/login'>Login</Link>
                            </div>
                            <div className="LinkWrapper">
                                <Link to='/signup'>Sign-Up</Link>
                            </div>
                        </>)}
                        {Boolean(details?.admin) &&
                        <div className="LinkWrapper">
                            <Link to='/adminpanel'>Admin-panel</Link>
                        </div>
                        }
                    </div>
                </div>
            </div>
            <AllGenres ref={genresRef} state={stateGenresList} onSetState = {setStateGenresList} />
            <Navigation/>
            
        </div>
        
        
    )
}

export default NavBurger