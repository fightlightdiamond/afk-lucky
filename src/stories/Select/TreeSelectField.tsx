import React, { useState, useCallback, useEffect } from "react";
import { CheckTreePicker, CheckTreePickerProps, PickerHandle } from "rsuite";
import "rsuite/dist/rsuite.min.css";
import inputStyles from "./CustomInput.module.css";
import clsx from "clsx";
import LoadingSpinner from "./LoadingSpinner";
import SelectAllFooter from "./SelectAllFooter";
import SelectFieldWrapper from "./SelectFieldWrapper";

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
      <SelectFieldWrapper
        label={label}
        required={required}
        helpMessage={helpMessage}
        error={error}
        size={size}
      >
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
      </SelectFieldWrapper>
    );
  }
);

TreeSelectField.displayName = "TreeSelectField";

export default TreeSelectField;
