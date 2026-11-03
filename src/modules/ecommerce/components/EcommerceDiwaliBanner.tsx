// src/modules/ecommerce/components/EcommerceDiwaliBanner.tsx
// Diwali hero banner: 3:1 card matches the artwork so it is never cropped, with a 3D tilt that follows the cursor
import React, { useRef } from 'react';
import diwaliBannerImg from '../../../assets/diwalibanners/diwali_banner_wide.png';

const MAX_TILT_DEG = 8;

interface EcommerceDiwaliBannerProps {
  onClick: () => void;
}

export const EcommerceDiwaliBanner: React.FC<EcommerceDiwaliBannerProps> = ({ onClick }) => {
  const cardRef = useRef<HTMLDivElement>(null);

  // Writes styles directly so mouse movement does not re-render the listing page
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const { left, top, width, height } = card.getBoundingClientRect();
    const x = (e.clientX - left) / width;
    const y = (e.clientY - top) / height;

    card.style.transform = `perspective(1200px) rotateX(${(0.5 - y) * MAX_TILT_DEG}deg) rotateY(${(x - 0.5) * MAX_TILT_DEG}deg) scale(1.01)`;
    card.style.setProperty('--sheen-x', `${x * 100}%`);
    card.style.setProperty('--sheen-y', `${y * 100}%`);
  };

  const handleMouseLeave = () => {
    if (cardRef.current) cardRef.current.style.transform = '';
  };

  return (
    <div
      ref={cardRef}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      role="button"
      tabIndex={0}
      className="relative w-full aspect-[3/1] bg-[#411500] rounded-2xl sm:rounded-3xl overflow-hidden [transform:perspective(1200px)_rotateX(3deg)] shadow-[0_2px_0_#b45309,0_4px_0_#92400e,0_6px_0_#78350f,0_8px_0_#5c2a0c,0_22px_36px_rgba(120,53,15,0.4)] cursor-pointer group transition-transform duration-200 ease-out focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-400"
      title="Happy Diwali Festive Season - Explore Offers"
    >
      <img
        src={diwaliBannerImg}
        alt="Happy Diwali - Festive Season Offers"
        loading="eager"
        draggable={false}
        className="block w-full h-full object-contain select-none pointer-events-none"
      />
      {/* Light sheen that follows the cursor */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none bg-[radial-gradient(circle_at_var(--sheen-x,50%)_var(--sheen-y,50%),rgba(255,255,255,0.22),transparent_45%)]" />
    </div>
  );
};

export default EcommerceDiwaliBanner;
