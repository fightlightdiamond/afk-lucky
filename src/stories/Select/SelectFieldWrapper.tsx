import React from "react";
import svgPaths from "../imports/svg-h5c2mha0kr";
import styles from "./SelectFieldWrapper.module.css";

export interface SelectFieldWrapperProps {
  label?: string;
  required?: boolean;
  helpMessage?: string;
  error?: boolean;
  size?: "xs" | "sm" | "md" | "lg";
  children: React.ReactNode;
}

const SelectFieldWrapper: React.FC<SelectFieldWrapperProps> = ({
  label,
  required,
  helpMessage,
  error,
  size = "md",
  children,
}) => {
  const inputContainerClass =
    size === "xs"
      ? styles.inputContainerXs
      : size === "sm"
      ? styles.inputContainerSm
      : size === "lg"
      ? styles.inputContainerLg
      : styles.inputContainerMd;

  return (
    <div className={styles.selectFieldWrapper}>
      {/* Label */}
      {label && (
        <div className={styles.labelWrapper}>
          <p className={styles.labelText}>{label}</p>
          {required && <p className={styles.requiredIndicator}>*</p>}
        </div>
      )}

      {/* Select field + Help message */}
      <div className={styles.fieldWrapper}>
        <div className={`${styles.inputContainer} ${inputContainerClass}`}>
          {children}
        </div>

        {/* Help message */}
        {helpMessage && (
          <div className={styles.helpMessageWrapper}>
            {/* Icon */}
            <div
              className={styles.helpIcon}
              data-name={error ? "Filled/alert-triangle" : "Filled/info-circle"}
            >
              <div
                className={`${styles.helpIconInner} ${
                  error ? styles.helpIconInnerError : styles.helpIconInnerInfo
                }`}
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
                error ? styles.helpMessageTextError : styles.helpMessageTextInfo
              }`}
            >
              <p className={styles.helpMessageParagraph}>{helpMessage}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SelectFieldWrapper;
