import React from "react";
import { TextField, MenuItem } from "@mui/material";
import { useField } from "formik";

const SelectFieldWrapper = ({
    name,
    label,
    options,
    // onChange,
    ...otherProps
}) => {
    const [field, meta] = useField(name);

    // const handleChange = (event) => {
    //     field.onChange(event); // Formik's internal change handler
    //     if (onChange) onChange(event); // Custom handler
    // };

    const configTextField = {
        fullWidth: true,
        variant: "outlined",
        select: true,
        label,
        ...field,
        // onChange: handleChange, // Use the combined handler
        ...otherProps,
    };

    if (meta && meta.touched && meta.error) {
        configTextField.error = true;
        configTextField.helperText = meta.error;
    }

    return (
        <TextField {...configTextField}>
            {options.map((option, idx) => (
                <MenuItem key={idx} value={option.value} >
                    {option.label}
                </MenuItem>
            ))}
        </TextField>
    );
};

export default SelectFieldWrapper;