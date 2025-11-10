import React from "react";
import CustomInput, { CustomInputProps } from "./CustomInput";
import { PickerHandle } from "rsuite";
import SelectFieldWrapper from "./SelectFieldWrapper";

export interface SelectFieldProps extends CustomInputProps {
  label?: string;
  required?: boolean;
  helpMessage?: string;
  size?: "xs" | "sm" | "md" | "lg";
}

const SelectField = React.forwardRef<PickerHandle, SelectFieldProps>(
  (
    { label, required, helpMessage, error, size = "md", ...inputProps },
    ref
  ) => {
    return (
      <SelectFieldWrapper
        label={label}
        required={required}
        helpMessage={helpMessage}
        error={error}
        size={size}
      >
        <CustomInput ref={ref} error={error} size={size} {...inputProps} />
      </SelectFieldWrapper>
    );
  }
);

SelectField.displayName = "SelectField";

export default SelectField;
