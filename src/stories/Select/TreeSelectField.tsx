import React, { useState, useCallback, useEffect } from "react";
import { CheckTreePicker, CheckTreePickerProps, PickerHandle } from "rsuite";
import "rsuite/dist/rsuite.min.css";
import styles from "./CustomInput.module.css";
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
        className="content-stretch flex flex-col gap-[4px] items-start w-full"
        data-name="Tree Select field"
      >
        {/* Label */}
        {label && (
          <div className="content-stretch flex font-['Pretendard',sans-serif] gap-[4px] items-center leading-[normal] not-italic relative shrink-0 text-nowrap whitespace-pre">
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

        {/* Tree Select field */}
        <div className="content-stretch flex flex-col gap-[4px] items-start relative shrink-0 w-full">
          <div className="w-full">
            <CheckTreePicker
              ref={ref}
              className={clsx(
                styles.customSelectWrapper,
                size === "xs"
                  ? styles.sizeXs
                  : size === "sm"
                  ? styles.sizeSm
                  : size === "lg"
                  ? styles.sizeLg
                  : styles.sizeMd,
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
            <div className="content-stretch flex gap-[4px] items-center relative shrink-0">
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
                className={clsx(
                  "flex flex-col font-['Pretendard',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[13px] text-nowrap",
                  error ? "text-[#d05c4e]" : "text-[#787e95]"
                )}
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

TreeSelectField.displayName = "TreeSelectField";

export default TreeSelectField;
