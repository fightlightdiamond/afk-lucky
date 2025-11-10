import React from "react";
import CustomInput, { CustomInputProps } from "./CustomInput";
import svgPaths from "../imports/svg-h5c2mha0kr";
import { PickerHandle } from "rsuite";
import styles from "./SelectField.module.css";

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
    const inputContainerClass =
      size === "xs"
        ? styles.inputContainerXs
        : size === "sm"
        ? styles.inputContainerSm
        : size === "lg"
        ? styles.inputContainerLg
        : styles.inputContainerMd;

    return (
      <div className={styles.selectFieldWrapper} data-name="Select field">
        {/* Label */}
        {label && (
          <div className={styles.labelWrapper} data-name="↳ hasLabel: true">
            <p className={styles.labelText}>{label}</p>
            {required && <p className={styles.requiredIndicator}>*</p>}
          </div>
        )}

        {/* Select field + Help message */}
        <div className={styles.fieldWrapper} data-name="_Selectfield">
          <div className={`${styles.inputContainer} ${inputContainerClass}`}>
            <CustomInput ref={ref} error={error} size={size} {...inputProps} />
          </div>

          {/* Help message */}
          {helpMessage && (
            <div
              className={styles.helpMessageWrapper}
              data-name="↳ hasHelptext: true"
            >
              {/* Icon */}
              <div
                className={styles.helpIcon}
                data-name={
                  error ? "Filled/alert-triangle" : "Filled/info-circle"
                }
              >
                <div
                  className={`${styles.helpIconInner} ${
                    error ? styles.helpIconInnerError : styles.helpIconInnerInfo
                  }`}
                  data-name="Vector"
                >
                  <div className={styles.helpIconSvgWrapper}>
                    <svg
                      className={styles.helpIconSvg}
                      fill="none"
                      preserveAspectRatio="none"
                      viewBox={error ? "0 0 11 10" : "0 0 10 10"}
                    >
                      <path
                        d={error ? svgPaths.p480e400 : svgPaths.p3870d900}
                        fill={error ? "#D05C4E" : "#787E95"}
                        stroke={error ? "#D05C4E" : "#787E95"}
                        id="Vector"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Message text */}
              <div
                className={`${styles.helpMessageText} ${
                  error
                    ? styles.helpMessageTextError
                    : styles.helpMessageTextInfo
                }`}
              >
                <p className={styles.helpMessageParagraph}>{helpMessage}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
);

SelectField.displayName = "SelectField";

export default SelectField;
