import React, { useState } from 'react';
import DefaultImage from "./drag-and-drop-icon.jpg"
import "./index.css"

const ImageInput = ({ ...props }) => {
  return (
    <div className={`imageInput ${!props?.image? "default" :""}`}>
      <label>
        <div className="imageContainer">
          <img src={ props?.image || DefaultImage}  alt='file input'></img>
        </div>
        <input
          type="file"
          accept="image/*"
          // multiple 
          // onChange={handleChange}
          // {...field}
          {...props}
          className={props.input}
          />
      </label>
      
      {/* {meta.touched && meta.error && <div>{meta.error}</div>} */}
    </div>
  );
};

export default ImageInput;


