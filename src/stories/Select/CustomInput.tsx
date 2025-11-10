import clsx from "clsx";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  PickerHandle,
  SelectPicker as RSelect,
  SelectPickerProps as RSelectProps,
} from "rsuite";
import "rsuite/dist/rsuite.min.css";
import styles from "./CustomInput.module.css";
import svgPaths from "../imports/svg-h5c2mha0kr";
import LoadingSpinner from "./LoadingSpinner";

export interface SelectOption {
  label: string;
  value: string | number;
}

export type SelectSize = "xs" | "sm" | "md" | "lg";

export type CustomInputProps = React.HTMLAttributes<HTMLDivElement> &
  Omit<RSelectProps, "onChange" | "data"> & {
    prefixText?: string;
    prefixIcon?: React.ReactNode;
    prefixInside?: boolean;
    onChange?: (value: string | number | null) => void;
    error?: boolean;
    badge?: string;
    disabled?: boolean;
    data?: SelectOption[];
    loading?: boolean;
    size?: SelectSize;
  };

const CustomInput = React.forwardRef<PickerHandle, CustomInputProps>(
  (
    {
      className,
      prefixText,
      prefixIcon,
      prefixInside = false,
      placeholder = "Placeholder text",
      children,
      onChange,
      data,
      value,
      error = false,
      badge,
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

    // Expose the picker ref through the forwarded ref
    React.useImperativeHandle(
      forwardedRef,
      () => {
        const current = pickerRef.current;
        return {
          open: () => {
            if (current && current.open) {
              current.open();
            }
          },
          close: () => {
            if (current && current.close) {
              current.close();
            }
          },
          updatePosition: () => {
            if (current && current.updatePosition) {
              current.updatePosition();
            }
          },
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
      (newValue: string | number | null) => {
        if (onChange) onChange(newValue);
      },
      [onChange]
    );

    const handleToggleClick = useCallback(() => {
      if (disabled) return;
      if (pickerRef.current && pickerRef.current.open) {
        pickerRef.current.open();
      }
    }, [disabled]);

    const handleOpen = useCallback(() => {
      setIsOpen(true);
    }, []);

    const handleClose = useCallback(() => {
      setIsOpen(false);
    }, []);

    // Get selected label
    const selectedItem = data?.find((item) => item.value === value);
    const displayText = selectedItem?.label || "";
    const showPlaceholder = !value;

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
        {/* Custom UI following Figma design */}
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
              {/* Prefix box - hiển thị nếu có prefixText hoặc prefixIcon */}
              {(prefixText || prefixIcon) && (
                <div
                  className={clsx(
                    styles.prefixBox,
                    prefixInside
                      ? prefixText
                        ? styles.prefixBoxInsideText
                        : styles.prefixBoxInsideIcon
                      : prefixText
                      ? styles.prefixBoxOutsideText
                      : styles.prefixBoxOutsideIcon
                  )}
                  data-name="↳ hasPrefix: true"
                >
                  {prefixInside && (
                    <div
                      aria-hidden="true"
                      className={styles.prefixBoxBorder}
                    />
                  )}

                  {prefixIcon ? (
                    <div className={styles.prefixIcon} data-name="edit-16">
                      {prefixIcon}
                    </div>
                  ) : (
                    <p className={styles.prefixText}>{prefixText}</p>
                  )}
                </div>
              )}

              {/* Value/Placeholder area */}
              <div
                className={styles.valueArea}
                data-name="_Select/placeholderText"
              >
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
                      {showPlaceholder ? placeholder : displayText}
                    </p>

                    {/* Badge component - chỉ hiển thị nếu có badge và có value */}
                    {badge && value && (
                      <div
                        className={styles.badge}
                        data-name="Component/ BadgeX"
                      >
                        <div className={styles.badgeText}>
                          <p className={styles.badgeTextInner}>{badge}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Icon */}
              <div
                className={styles.chevronIcon}
                data-name="Outline/chevron-down"
              >
                <div
                  className={styles.chevronIconInner}
                  data-name="Vector (Stroke)"
                >
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

          {/* Border - exactly like Figma */}
          <div aria-hidden="true" className={styles.customToggleBorder} />
        </div>

        {/* Hidden rsuite SelectPicker for functionality */}
        <RSelect
          ref={pickerRef}
          className={clsx(styles.hiddenPicker, className)}
          cleanable={false}
          searchable={false}
          onChange={handleChange}
          onOpen={handleOpen}
          onClose={handleClose}
          data={data || []}
          value={value}
          disabled={disabled}
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
        </RSelect>
      </div>
    );
  }
);

CustomInput.displayName = "CustomInput";

export default React.memo(CustomInput);
