// src/modules/ecommerce/components/EcommerceDiwaliPosters.tsx
// Row of small Diwali offer posters shown under the hero banner; scrolls sideways on narrow screens
import React from 'react';
import poster1 from '../../../assets/diwalibanners/diwaliposters1.png';
import poster2 from '../../../assets/diwalibanners/diwaliposters2.png';
import poster3 from '../../../assets/diwalibanners/diwaliposters3.png';
import poster4 from '../../../assets/diwalibanners/diwaliposters4.png';

const POSTERS = [
  { id: 'ferrero-rocher', image: poster1, alt: 'Diwali Special - Ferrero Rocher up to 50% off' },
  { id: 'ruchoks-crackers', image: poster2, alt: 'Diwali Special - Ruchoks gift box up to 50% off' },
  { id: 'ruchoks-hamper', image: poster3, alt: 'Diwali Special - Ruchoks hamper up to 50% off' },
  { id: 'ferrero-collection', image: poster4, alt: 'Diwali Special - Ferrero Collection up to 50% off' },
];

interface EcommerceDiwaliPostersProps {
  onClick: () => void;
}

export const EcommerceDiwaliPosters: React.FC<EcommerceDiwaliPostersProps> = ({ onClick }) => {
  return (
    <section
      aria-label="Diwali offers"
      className="flex lg:grid lg:grid-cols-4 gap-3 lg:gap-5 overflow-x-auto no-scrollbar py-1"
    >
      {POSTERS.map((poster) => (
        <button
          key={poster.id}
          type="button"
          onClick={onClick}
          aria-label={poster.alt}
          className="w-56 sm:w-64 lg:w-auto aspect-[6/5] shrink-0 rounded-xl overflow-hidden border border-amber-200/80 shadow-xs cursor-pointer transition-transform duration-300 hover:-translate-y-1 hover:shadow-md focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-400"
        >
          {/* 6:5 card with this position trims only the decorative border, keeping the badge and offer text */}
          <img
            src={poster.image}
            alt=""
            loading="lazy"
            draggable={false}
            className="block w-full h-full object-cover object-[center_30%] select-none pointer-events-none"
          />
        </button>
      ))}
    </section>
  );
};

export default EcommerceDiwaliPosters;
