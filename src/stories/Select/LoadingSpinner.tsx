import React from "react";
import styles from "./LoadingSpinner.module.css";

interface LoadingSpinnerProps {
  text?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  text = "Loading...",
}) => {
  return (
    <div className={styles.loadingContainer}>
      <svg
        className={styles.spinner}
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="10"
          cy="10"
          r="8"
          stroke="#E8EAED"
          strokeWidth="2.5"
          fill="none"
        />
        <path
          d="M 10 2 A 8 8 0 0 1 18 10"
          stroke="#9CA3AF"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
      <span className={styles.loadingText}>{text}</span>
    </div>
  );
};

export default LoadingSpinner;
