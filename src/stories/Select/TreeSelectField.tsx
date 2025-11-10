import React, { useState, useCallback, useEffect } from "react";
import { CheckTreePicker, CheckTreePickerProps, PickerHandle } from "rsuite";
import "rsuite/dist/rsuite.min.css";
import inputStyles from "./CustomInput.module.css";
import styles from "./TreeSelectField.module.css";
import clsx from "clsx";
import svgPaths from "../imports/svg-h5c2mha0kr";
import LoadingSpinner from "./LoadingSpinner";
import SelectAllFooter from "./SelectAllFooter";

export interface TreeSelectFieldProps extends CheckTreePickerProps {
  label?: string;
  required?: boolean;
  helpMessage?: string;
  error?: boolean;
  loading?: boolean;
  showSelectAll?: boolean;
  size?: "xs" | "sm" | "md" | "lg";
}

const TreeSelectField = React.forwardRef<PickerHandle, TreeSelectFieldProps>(
  (
    {
      label,
      required,
      helpMessage,
      error,
      loading,
      renderMenu,
      showSelectAll = false,
      size = "md",
      data = [],
      value,
      onChange,
      ...pickerProps
    },
    ref
  ) => {
    const [selectedValues, setSelectedValues] = useState<(string | number)[]>(
      (value as (string | number)[]) || []
    );

    useEffect(() => {
      setSelectedValues((value as (string | number)[]) || []);
    }, [value]);

    // Helper function to get all values from tree data
    const getAllTreeValues = useCallback(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (treeData: any[]): (string | number)[] => {
        const values: (string | number)[] = [];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const traverse = (nodes: any[]) => {
          nodes.forEach((node) => {
            if (node.value !== undefined) {
              values.push(node.value);
            }
            if (node.children && node.children.length > 0) {
              traverse(node.children);
            }
          });
        };
        traverse(treeData);
        return values;
      },
      []
    );

    const handleSelectAll = useCallback(() => {
      const allValues = getAllTreeValues(data);
      const isAllSelected = allValues.every((val) =>
        selectedValues.includes(val)
      );

      const newValues = isAllSelected ? [] : allValues;
      setSelectedValues(newValues);
      if (onChange) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onChange(newValues, null as any);
      }
    }, [data, selectedValues, onChange, getAllTreeValues]);

    const handleChange = useCallback(
      (newValue: (string | number)[] | null) => {
        const values = newValue || [];
        setSelectedValues(values);
        if (onChange) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onChange(values as any, null as any);
        }
      },
      [onChange]
    );

    const allValues = getAllTreeValues(data);
    const isAllSelected =
      allValues.length > 0 &&
      allValues.every((val) => selectedValues.includes(val));

    const customRenderMenu = useCallback(
      (menu: React.ReactNode) => {
        const menuContent = renderMenu ? renderMenu(menu) : menu;
        return (
          <div>
            {menuContent}
            {loading && <LoadingSpinner />}
          </div>
        );
      },
      [renderMenu, loading]
    );

    const renderExtraFooter = useCallback(() => {
      if (!showSelectAll) return null;
      return (
        <SelectAllFooter
          onSelectAll={handleSelectAll}
          isAllSelected={isAllSelected}
        />
      );
    }, [showSelectAll, handleSelectAll, isAllSelected]);

    return (
      <div
        className={styles.treeSelectFieldWrapper}
        data-name="Tree Select field"
      >
        {/* Label */}
        {label && (
          <div className={styles.labelWrapper}>
            <p className={styles.labelText}>{label}</p>
            {required && <p className={styles.requiredIndicator}>*</p>}
          </div>
        )}

        {/* Tree Select field */}
        <div className={styles.fieldWrapper}>
          <div className={styles.inputContainer}>
            <CheckTreePicker
              ref={ref}
              className={clsx(
                inputStyles.customSelectWrapper,
                size === "xs"
                  ? inputStyles.sizeXs
                  : size === "sm"
                  ? inputStyles.sizeSm
                  : size === "lg"
                  ? inputStyles.sizeLg
                  : inputStyles.sizeMd,
                error && "error-state"
              )}
              cascade={true}
              uncheckableItemValues={[]}
              block
              countable={false}
              data={data}
              value={selectedValues}
              onChange={handleChange}
              renderMenu={loading || renderMenu ? customRenderMenu : undefined}
              renderExtraFooter={renderExtraFooter}
              {...pickerProps}
            />
          </div>

          {/* Help message */}
          {helpMessage && (
            <div className={styles.helpMessageWrapper}>
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

TreeSelectField.displayName = "TreeSelectField";

export default TreeSelectField;
