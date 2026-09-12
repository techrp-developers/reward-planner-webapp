// src/components/home/BrandPartnersSection.jsx
import React from 'react';
import brandStrip1 from '../../assets/brand-strip-1.svg';
import brandStrip2 from '../../assets/brand-strip-2.svg';

// Material UI Icons
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined';

export const BrandPartnersSection = () => {
  return (
    <section className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200/80 p-3.5 sm:p-6 shadow-xs space-y-3 sm:space-y-3.5 relative overflow-hidden">
      {/* Subtle top ambient sheen */}
      <div className="absolute top-0 inset-x-0 h-20 bg-gradient-to-b from-violet-50/70 via-pink-50/20 to-transparent pointer-events-none" />

      {/* SECTION HEADER */}
      <div className="relative z-10 text-center max-w-3xl mx-auto space-y-1 sm:space-y-1.5">
        <h3 className="text-base sm:text-xl md:text-2xl font-bold text-gray-900 tracking-tight">
          Trusted by Clients & Brand Partners
        </h3>

        <p className="text-xs sm:text-sm text-gray-500 font-normal max-w-2xl mx-auto leading-relaxed">
          A premium rewards and benefits experience for companies, teams, employees and individual users.
        </p>
      </div>

      {/* BRAND LOGOS SINGLE-ROW CONTINUOUS MARQUEE STRIP */}
      <div className="relative z-10 pt-1 overflow-hidden">
        {/* Left & Right Smooth Fade Masks */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-12 sm:w-28 bg-gradient-to-r from-white via-white/80 to-transparent z-20" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-12 sm:w-28 bg-gradient-to-l from-white via-white/80 to-transparent z-20" />

        {/* Single Continuous Row combining brand-strip-1 and brand-strip-2 */}
        <div className="relative overflow-hidden py-1.5 rounded-xl sm:rounded-2xl bg-gray-50/60 border border-gray-100/90 shadow-2xs">
          <div
            className="animate-marquee flex items-center gap-6 sm:gap-8 py-1.5 sm:py-2"
            style={{ animationDuration: '45s' }}
          >
            <img
              src={brandStrip1}
              alt="Brand Partners"
              className="h-8 sm:h-12 md:h-16 w-auto max-w-none shrink-0 opacity-90 hover:opacity-100 transition-opacity"
            />
            <img
              src={brandStrip2}
              alt="Brand Partners"
              className="h-8 sm:h-12 md:h-16 w-auto max-w-none shrink-0 opacity-90 hover:opacity-100 transition-opacity"
            />
            {/* Duplicate pair for 100% seamless infinite looping */}
            <img
              src={brandStrip1}
              alt="Brand Partners"
              className="h-8 sm:h-12 md:h-16 w-auto max-w-none shrink-0 opacity-90 hover:opacity-100 transition-opacity"
            />
            <img
              src={brandStrip2}
              alt="Brand Partners"
              className="h-8 sm:h-12 md:h-16 w-auto max-w-none shrink-0 opacity-90 hover:opacity-100 transition-opacity"
            />
          </div>
        </div>
      </div>

      {/* FOOTER TRUST STATEMENT */}
      <div className="relative z-10 pt-2 border-t border-gray-100 flex flex-wrap items-center justify-center gap-2 sm:gap-6 text-[10px] sm:text-xs font-semibold text-gray-500">
        <span className="flex items-center gap-1.5">
          <VerifiedOutlinedIcon sx={{ fontSize: 15 }} className="text-emerald-600" />
          <span>100% Authentic Brand Guarantees</span>
        </span>
        <span className="hidden sm:inline text-gray-300">•</span>
        <span>500+ Corporate Workplaces Powered</span>
        <span className="hidden sm:inline text-gray-300">•</span>
        <span>Instant RP Coins & Voucher Fulfillment</span>
      </div>
    </section>
  );
};

export default BrandPartnersSection;
