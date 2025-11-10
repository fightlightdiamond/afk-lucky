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
                    "box-border content-stretch flex gap-[10px] h-full items-center relative shrink-0",
                    prefixInside
                      ? prefixText
                        ? "bg-[#f1f3f8] px-[12px] py-[10px] justify-center"
                        : "bg-[#f1f3f8] px-[12px] py-[10px]"
                      : prefixText
                      ? "justify-center pl-[12px] pr-[10px] py-[8px]"
                      : "pl-[12px] pr-[10px] py-[10px]"
                  )}
                  data-name="↳ hasPrefix: true"
                >
                  {prefixInside && (
                    <div
                      aria-hidden="true"
                      className="absolute border border-[#d1d5de] border-solid inset-0 pointer-events-none"
                    />
                  )}

                  {prefixIcon ? (
                    <div
                      className="overflow-clip relative shrink-0 size-[16px]"
                      data-name="edit-16"
                    >
                      {prefixIcon}
                    </div>
                  ) : (
                    <p className="font-['Pretendard',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#282c3b] text-[12px] text-nowrap whitespace-pre m-0">
                      {prefixText}
                    </p>
                  )}
                </div>
              )}

              {/* Value/Placeholder area */}
              <div
                className="basis-0 grow min-h-px min-w-px relative shrink-0"
                data-name="_Select/placeholderText"
              >
                <div className="flex flex-row items-center size-full">
                  <div className="box-border content-stretch flex gap-[8px] items-center pl-[10px] pr-[8px] py-0 relative w-full">
                    <p
                      className={clsx(
                        "[white-space-collapse:collapse] basis-0 font-['Pretendard',sans-serif] grow leading-[normal] min-h-px min-w-px not-italic overflow-ellipsis overflow-hidden relative shrink-0 text-[12px] text-nowrap m-0",
                        showPlaceholder ? "text-[#787e95]" : "text-[#282c3b]"
                      )}
                    >
                      {showPlaceholder ? placeholder : displayText}
                    </p>

                    {/* Badge component - chỉ hiển thị nếu có badge và có value */}
                    {badge && value && (
                      <div
                        className="bg-[#131313] box-border content-stretch flex gap-[2px] items-center justify-center overflow-clip px-[6px] py-[5px] relative rounded-[25px] shrink-0"
                        data-name="Component/ BadgeX"
                      >
                        <div className="flex flex-col font-['Inter',sans-serif] justify-end leading-[0] not-italic relative shrink-0 text-[10px] text-nowrap text-white">
                          <p className="leading-[9px] whitespace-pre m-0">
                            {badge}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Icon */}
              <div
                className="overflow-clip relative shrink-0 size-[16px]"
                data-name="Outline/chevron-down"
              >
                <div
                  className="absolute inset-[34.38%_21.88%]"
                  data-name="Vector (Stroke)"
                >
                  <div className="absolute inset-0">
                    <svg
                      className="block size-full"
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
