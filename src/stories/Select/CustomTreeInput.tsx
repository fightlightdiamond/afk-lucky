import clsx from "clsx";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  PickerHandle,
  CheckTreePicker as RCheckTreePicker,
  CheckTreePickerProps as RCheckTreePickerProps,
} from "rsuite";
import "rsuite/dist/rsuite.min.css";
import styles from "./CustomInput.module.css";
import svgPaths from "../imports/svg-h5c2mha0kr";
import LoadingSpinner from "./LoadingSpinner";

export type SelectSize = "xs" | "sm" | "md" | "lg";

export type CustomTreeInputProps = React.HTMLAttributes<HTMLDivElement> &
  Omit<RCheckTreePickerProps, "onChange"> & {
    onChange?: (value: (string | number)[] | null) => void;
    error?: boolean;
    disabled?: boolean;
    loading?: boolean;
    size?: SelectSize;
  };

const CustomTreeInput = React.forwardRef<PickerHandle, CustomTreeInputProps>(
  (
    {
      className,
      placeholder = "Search",
      children,
      onChange,
      data,
      value,
      error = false,
      disabled = false,
      loading = false,
      renderMenu,
      size = "md",
      ...props
    },
    forwardedRef
  ) => {
    const [isClient, setIsClient] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const pickerRef = useRef<PickerHandle>(null);

    React.useImperativeHandle(
      forwardedRef,
      () => {
        const current = pickerRef.current;
        return {
          open: () => current?.open?.(),
          close: () => current?.close?.(),
          updatePosition: () => current?.updatePosition?.(),
          get target() {
            return current?.target ?? null;
          },
          get root() {
            return current?.root ?? null;
          },
          get overlay() {
            return current?.overlay ?? null;
          },
        } as PickerHandle;
      },
      []
    );

    useEffect(() => {
      setIsClient(true);
    }, []);

    const handleChange = useCallback(
      (newValue: (string | number)[] | null) => {
        if (onChange) onChange(newValue);
      },
      [onChange]
    );

    const handleToggleClick = useCallback(() => {
      if (disabled) return;
      if (pickerRef.current?.open) {
        pickerRef.current.open();
      }
    }, [disabled]);

    const handleOpen = useCallback(() => {
      setIsOpen(true);
    }, []);

    const handleClose = useCallback(() => {
      setIsOpen(false);
    }, []);

    const selectedValues = (value as (string | number)[]) || [];
    const selectedCount = selectedValues.length;
    const showPlaceholder = selectedCount === 0;

    // Helper to get all child values of a node
    const getChildValues = (node: any): (string | number)[] => {
      if (!node.children || node.children.length === 0) return [];
      const values: (string | number)[] = [];
      node.children.forEach((child: unknown) => {
        values.push(child.value);
        values.push(...getChildValues(child));
      });
      return values;
    };

    // Build display text with parent (All) logic
    const displayLabels: string[] = [];
    const processedValues = new Set<string | number>();

    data?.forEach((node: unknown) => {
      if (selectedValues.includes(node.value)) {
        // Parent is selected, always show as "Parent (All)"
        displayLabels.push(`${node.label} (All)`);
        processedValues.add(node.value);
        // Mark all children as processed
        const childValues = getChildValues(node);
        childValues.forEach((val) => processedValues.add(val));
      }
    });

    // Add remaining selected items
    selectedValues.forEach((val) => {
      if (!processedValues.has(val)) {
        const findLabel = (nodes: unknown[]): string | null => {
          for (const node of nodes) {
            if (node.value === val) return node.label;
            if (node.children) {
              const label = findLabel(node.children);
              if (label) return label;
            }
          }
          return null;
        };
        const label = findLabel(data || []);
        if (label) displayLabels.push(label);
      }
    });

    const displayText = showPlaceholder
      ? placeholder
      : displayLabels.join(", ");

    if (!isClient) return null;

    const sizeClass =
      size === "xs"
        ? styles.sizeXs
        : size === "sm"
        ? styles.sizeSm
        : size === "lg"
        ? styles.sizeLg
        : styles.sizeMd;

    return (
      <div className={clsx(styles.customSelectWrapper, sizeClass)}>
        <div
          className={clsx(
            styles.customToggle,
            sizeClass,
            isOpen && styles.customToggleOpen,
            disabled && styles.customToggleDisabled,
            error && styles.customToggleError
          )}
          onClick={handleToggleClick}
        >
          <div className={styles.customToggleInner}>
            <div className={styles.customToggleContent}>
              <div className={styles.valueArea}>
                <div className={styles.valueAreaInner}>
                  <div className={styles.valueContent}>
                    <p
                      className={clsx(
                        styles.valueText,
                        showPlaceholder
                          ? styles.valueTextPlaceholder
                          : styles.valueTextSelected
                      )}
                    >
                      {displayText}
                    </p>

                    {/* Badge for count */}
                    {!showPlaceholder && displayLabels.length > 0 && (
                      <div className={styles.badge}>
                        <div className={styles.badgeText}>
                          <p className={styles.badgeTextInner}>
                            {displayLabels.length}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className={styles.chevronIcon}>
                <div className={styles.chevronIconInner}>
                  <div className={styles.chevronIconSvgWrapper}>
                    <svg
                      className={styles.chevronIconSvg}
                      fill="none"
                      preserveAspectRatio="none"
                      viewBox="0 0 9 5"
                    >
                      <path d={svgPaths.p2a326440} fill="#282C3B" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div aria-hidden="true" className={styles.customToggleBorder} />
        </div>

        <RCheckTreePicker
          ref={pickerRef}
          className={clsx(styles.hiddenPicker, className)}
          cleanable={false}
          searchable={false}
          onChange={handleChange}
          onOpen={handleOpen}
          onClose={handleClose}
          data={data || []}
          value={selectedValues}
          disabled={disabled}
          cascade={true}
          uncheckableItemValues={[]}
          menuMaxHeight={250}
          menuStyle={{ marginTop: 0 }}
          renderMenu={
            loading
              ? (menu: React.ReactNode) => (
                  <div>
                    {renderMenu ? renderMenu(menu) : menu}
                    <LoadingSpinner />
                  </div>
                )
              : renderMenu
          }
          {...props}
        >
          {children}
        </RCheckTreePicker>
      </div>
    );
  }
);

CustomTreeInput.displayName = "CustomTreeInput";

export default React.memo(CustomTreeInput);
