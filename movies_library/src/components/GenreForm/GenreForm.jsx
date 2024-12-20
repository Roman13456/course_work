import React, { useEffect, useState } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import CheckboxWrapper from "../formsUI/CheckboxWrapper/CheckboxWrapper";
import { Button } from "@mui/material";
import userApi from "../../api/userApi";
import "./GenreForm.css"


// Validation schema
const validationSchema = Yup.object().shape({
  genres: Yup.array().of(Yup.string()),
});

const GenreForm = ({ onSubmit, excludedGenres }) => {
  const [genres, setGenres] = useState([]);
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    async function getGenres() {
        const { data } = await userApi.getUserGenreWeights();

        // Find the maximum weight to normalize
        const maxWeight = Math.max(...data.genreWeights.map(g => g.weight));

        const genreOptions = data.genreWeights.map(({genre, weight}) => ({
            label: genre,
            value: genre,
            color: weight === 0 ? "#ffffff" : `rgba(255, 140, 0, ${0.2 + (weight / maxWeight) * 0.8})`
            // `rgba(138, 43, 226, ${0.2 + (weight / maxWeight) * 0.8})`
        }));
        console.log("genreOptions",data.genreWeights)
        setGenres(genreOptions);
    }
    getGenres();
}, []);

  return (
    <Formik
      initialValues={{genres: excludedGenres }}
      validationSchema={validationSchema}
      onSubmit={({genres}) => {
        // console.log("genres.join(",")",values)
        onSubmit(genres.join(","));
      }}
    >
      {({ values, setFieldValue }) => (
        <Form className="genresExculsionForm">
          {/* Genre checkboxes */}
          <div className="checkboxContainer">
          {isVisible && <p style={{fontSize:"14px"}}>*
          The brighter the color, the more influence a genre has on your movie 
          recommendations. Movies are sorted by genres with the brightest colors 
          first. 
          If you want to reduce a genre's impact, simply uncheck it. 
          Movies from that genre may still appear, but it won’t affect how 
          your recommendations are shaped.</p>} 
          <span onClick={() => setIsVisible(!isVisible)} style={{ cursor: 'pointer', color: 'blue', textDecoration: 'underline' }}>
            {isVisible ? "Hide genres" : "Show genres"}
          </span>
            {isVisible && genres.map(({label, value, color},idx) => (
                <div className="checkboxItem" key={idx}
                style={{ backgroundColor: color }}
                >
                    <CheckboxWrapper
                      name="genres"
                      label={label}
                      value={value}
                      checked={values.genres.includes(value)}
                      onChange={() => {
                        const updatedGenres = values.genres.includes(value)
                          ? values.genres.filter((g) => g !== value)
                          : [...values.genres, value];
                        setFieldValue("genres", updatedGenres);
                      }}
                    />
                </div>
            ))}
          </div>

          {/* Refresh button */}
          <Button style={{marginTop:"10px"}} type="submit" variant="contained" color="primary">
            Refresh
          </Button>
        </Form>
      )}
    </Formik>
  );
};

export default GenreForm;
