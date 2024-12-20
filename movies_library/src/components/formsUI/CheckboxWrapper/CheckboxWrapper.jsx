// CheckboxWrapper.js
import React from "react";
import { useField } from "formik";
import { Checkbox, FormControlLabel } from "@mui/material";

const CheckboxWrapper = ({ name, label, ...otherProps }) => {
  const [field] = useField({ name, type: "checkbox" });

  const configCheckbox = {
    ...field,
    ...otherProps,
  };

  return (
    <FormControlLabel
      control={<Checkbox {...configCheckbox} />}
      label={label}
    />
  );
};

export default CheckboxWrapper;
