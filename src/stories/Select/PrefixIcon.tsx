import React from "react";

export const ChevronDownIcon: React.FC = () => {
  return (
    <div
      className="absolute bottom-[37.5%] left-1/4 right-1/4 top-[37.5%]"
      data-name="Vector"
    >
      <div className="absolute inset-[-25%_-12.5%]">
        <svg
          className="block size-full"
          fill="none"
          preserveAspectRatio="none"
          viewBox="0 0 10 6"
        >
          <path
            d="M1 1L5 5L9 1"
            id="Vector"
            stroke="#354052"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
        </svg>
      </div>
    </div>
  );
};
