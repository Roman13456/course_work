import React from "react";
import { TextareaAutosize, FormHelperText } from "@mui/material";
import { useField } from "formik";
import styled from "styled-components";
import "./textarea.css"

const TextareaWrapper = ({
  name,
  placeholder,
  ...otherProps
}) => {
  const [field, meta] = useField(name);

  const showError = meta.touched && meta.error;

  return (
    <div className="wrapperForTextarea">
      <TextareaAutosize
        
        variant="outlined"
        className={`${showError &&"invalid"}`}
        minRows={3}
        {...field}
        {...otherProps}
        placeholder={placeholder}
      />
      {showError && <FormHelperText>{meta.error}</FormHelperText>}
    </div>
  );
};

export default TextareaWrapper;
