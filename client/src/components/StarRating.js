import React from 'react';

function StarRating({ rating, size = 'md', interactive = false, onRate }) {
  const sizes = { sm: 'text-sm', md: 'text-xl', lg: 'text-3xl' };

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          onClick={() => interactive && onRate && onRate(star)}
          className={`${sizes[size]} transition
            ${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'}
            ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
          disabled={!interactive}>
          ★
        </button>
      ))}
    </div>
  );
}

export default StarRating;