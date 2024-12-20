import SelectFieldWrapper from "../formsUI/SelectFieldWrapper/SelectFieldWrapper";
import "./genresPicker.css";
import moviesApi from "../../api/moviesApi";
import { useEffect, useState } from "react";

import { FormHelperText } from "@mui/material";

const GenresListPicker = ({genres:selectedGenres, setFieldTouched, errors, 
    touched, setFieldValue}) => {
    //, setSelectedGenres
    const [genres, setGenres] = useState([]);
    const [selectedGenre, setSelectedGenre] = useState('');  // Stores the currently selected genre
    

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


    // Add selected genre to the list, preventing duplicates
    const handleAddGenre = () => {
         // Find the selected genre object from `genres` using the selected genre ID
         const genreToAdd = genres.find(g => g.value === selectedGenre);
        
        if (genreToAdd  && 
            !selectedGenres.some(g => g.id === genreToAdd.value)) {

            const updatedGenres = [...selectedGenres, 
                { name: genreToAdd.label, id: genreToAdd.value }];
            setFieldValue("genres", updatedGenres); // Update Formik’s value
            setSelectedGenre(""); // Reset selected genre in dropdown
            setFieldTouched("genres", true, false); // Mark as touched for validation
        }
    };

    // Remove genre from the selected list
    const handleRemoveGenre = (genre) => {
        const updatedGenres = selectedGenres.filter(g => g.id !== genre.id);
        setFieldValue("genres", updatedGenres); // Update Formik’s value
        setFieldTouched("genres", true, false)
    };

    return (
        <div className="genrespicker">
            {/* Genre Selector */}
            <div className="genresContainer">
                {genres.length > 0 && (
                    <>
                        <SelectFieldWrapper 
                            name="genres" 
                            className={`inputGenre ${touched.selectedGenres && errors.selectedGenres && "errorState"}`}
                            label="Select Genre" 
                            options={genres}
                            value={selectedGenre}
                            onChange={(e) => setSelectedGenre(e.target.value)}
                        />
                        {/* Add Genre Button */}
                        <button type="button" onClick={handleAddGenre} 
                        disabled={!selectedGenre}>
                            ADD GENRE
                        </button>
                    </>
                )}
            </div>
            

            {/* Selected Genres Display */}
            <div className="selected-genres">
                {selectedGenres.map((genre) => (
                    <div key={genre.id} className="selected-genre">
                        <span>{genre.name}</span>
                        <button type="button" 
                        onClick={() => handleRemoveGenre(genre)}>x</button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default GenresListPicker;
