import React, { useState, useCallback, useEffect } from "react";
import { PickerHandle } from "rsuite";
import "rsuite/dist/rsuite.min.css";
import LoadingSpinner from "./LoadingSpinner";
import SelectAllFooter from "./SelectAllFooter";
import SelectFieldWrapper from "./SelectFieldWrapper";
import CustomMultiInput, { CustomMultiInputProps } from "./CustomMultiInput";

export interface MultiSelectFieldProps extends CustomMultiInputProps {
  label?: string;
  required?: boolean;
  helpMessage?: string;
  loading?: boolean;
  showSelectAll?: boolean;
}

const MultiSelectField = React.forwardRef<PickerHandle, MultiSelectFieldProps>(
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

    const handleSelectAll = useCallback(() => {
      const allValues = data.map((item) => item.value);
      const isAllSelected = allValues.every((val) =>
        selectedValues.includes(val)
      );

      const newValues = isAllSelected ? [] : allValues;
      setSelectedValues(newValues);
      if (onChange) {
        onChange(newValues);
      }
    }, [data, selectedValues, onChange]);

    const handleChange = useCallback(
      (newValue: (string | number)[] | null) => {
        const values = newValue || [];
        setSelectedValues(values);
        if (onChange) {
          onChange(values);
        }
      },
      [onChange]
    );

    const isAllSelected =
      data.length > 0 &&
      data.every((item) => selectedValues.includes(item.value));

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
        <CustomMultiInput
          ref={ref}
          error={error}
          size={size}
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

MultiSelectField.displayName = "MultiSelectField";

export default MultiSelectField;
