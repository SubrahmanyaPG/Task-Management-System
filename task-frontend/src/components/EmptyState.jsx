import React from 'react';

export default function EmptyState({ isFiltered }) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon-wrapper">
        <svg
          className="empty-state-svg"
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="60" cy="60" r="50" className="empty-circle" />
          <path
            d="M45 55L55 65L75 45"
            className="empty-check"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M45 80H75"
            className="empty-line"
            strokeLinecap="round"
          />
          <path
            d="M45 90H60"
            className="empty-line-short"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <h3 className="empty-state-title">
        {isFiltered ? 'No matching tasks' : 'Your list is empty'}
      </h3>
      <p className="empty-state-description">
        {isFiltered
          ? 'Try broadening your filters or search criteria to find tasks.'
          : 'Organize your day. Create a new task to start tracking.'}
      </p>
    </div>
  );
}
