// src/components/ui/StarRating.jsx
import React from 'react';

export const StarRating = ({ rating = 0, count, className = '' }) => {
  const safeRating = Math.max(0, Math.min(5, Math.round(Number(rating) || 0)));
  const filledStars = '★'.repeat(safeRating);
  const emptyStars = '★'.repeat(5 - safeRating);

  return (
    <div className={`inline-flex items-center gap-1 ${className}`}>
      <span className="text-xs tracking-tighter" style={{ color: '#FFC514' }}>
        {filledStars}
      </span>
      <span className="text-xs tracking-tighter text-gray-300">
        {emptyStars}
      </span>
      {count !== undefined && (
        <span className="text-[11px] text-gray-500 font-normal ml-0.5">
          ({count})
        </span>
      )}
    </div>
  );
};

export default React.memo(StarRating);
