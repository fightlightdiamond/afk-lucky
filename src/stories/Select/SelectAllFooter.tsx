import React from "react";
import styles from "./SelectAllFooter.module.css";

interface SelectAllFooterProps {
  onSelectAll: () => void;
  isAllSelected: boolean;
}

const SelectAllFooter: React.FC<SelectAllFooterProps> = ({
  onSelectAll,
  isAllSelected,
}) => {
  return (
    <div className={styles.selectAllContainer} onClick={onSelectAll}>
      <div className={styles.checkbox}>
        {isAllSelected && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path
              d="M1 4L3.5 6.5L9 1"
              stroke="#282C3B"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>
      <span className={styles.selectAllText}>Select All</span>
    </div>
  );
};

export default SelectAllFooter;
