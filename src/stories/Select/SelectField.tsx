import React from "react";
import CustomInput, { CustomInputProps } from "./CustomInput";
import svgPaths from "../imports/svg-h5c2mha0kr";
import { PickerHandle } from "rsuite";

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
    const heightClass =
      size === "xs"
        ? "h-[24px]"
        : size === "sm"
        ? "h-[28px]"
        : size === "lg"
        ? "h-[40px]"
        : "h-[32px]";

    return (
      <div
        className="content-stretch flex flex-col gap-[4px] items-start w-full"
        data-name="Select field"
      >
        {/* Label */}
        {label && (
          <div
            className="content-stretch flex font-['Pretendard',sans-serif] gap-[4px] items-center leading-[normal] not-italic relative shrink-0 text-nowrap whitespace-pre"
            data-name="↳ hasLabel: true"
          >
            <p className="relative shrink-0 text-[#282c3b] text-[13px] m-0">
              {label}
            </p>
            {required && (
              <p className="relative shrink-0 text-[#d05c4e] text-[12px] m-0">
                *
              </p>
            )}
          </div>
        )}

        {/* Select field + Help message */}
        <div
          className="content-stretch flex flex-col gap-[4px] items-start relative shrink-0 w-full"
          data-name="_Selectfield"
        >
          <div className={`${heightClass} w-full`}>
            <CustomInput ref={ref} error={error} size={size} {...inputProps} />
          </div>

          {/* Help message */}
          {helpMessage && (
            <div
              className="content-stretch flex gap-[4px] items-center relative shrink-0"
              data-name="↳ hasHelptext: true"
            >
              {/* Icon */}
              <div
                className="overflow-clip relative shrink-0 size-[12px]"
                data-name={
                  error ? "Filled/alert-triangle" : "Filled/info-circle"
                }
              >
                <div
                  className={
                    error
                      ? "absolute inset-[6.96%_4.17%_12.52%_4.17%]"
                      : "absolute inset-[8.33%_8.33%_8.3%_8.33%]"
                  }
                  data-name="Vector"
                >
                  <div className="absolute inset-0">
                    <svg
                      className="block size-full"
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
                className={`flex flex-col font-['Pretendard',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[13px] text-nowrap ${
                  error ? "text-[#d05c4e]" : "text-[#787e95]"
                }`}
              >
                <p className="leading-[normal] whitespace-pre m-0">
                  {helpMessage}
                </p>
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
