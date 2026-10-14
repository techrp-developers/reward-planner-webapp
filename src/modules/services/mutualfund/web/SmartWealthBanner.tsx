import Sparkles from '@mui/icons-material/AutoAwesome';
import heroBackground from '../../../../assets/servicescards/mutual-fund-hero-background.webp';

interface SmartWealthBannerProps {
  onScrollToCalculators?: () => void;
  onScrollToFaq?: () => void;
  onScrollToLearning?: () => void;
}

export default function SmartWealthBanner({
  onScrollToCalculators,
  onScrollToFaq,
  onScrollToLearning,
}: SmartWealthBannerProps) {
  const handleScroll = (targetId: string, focusId?: string, fallback?: () => void) => {
    if (fallback) {
      fallback();
      return;
    }
    const el = document.getElementById(targetId);
    if (el) {
      const headerOffset = 90;
      const elementPosition = el.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({
        top: Math.max(0, offsetPosition),
        behavior: 'smooth',
      });
      if (focusId) {
        window.setTimeout(() => {
          document.getElementById(focusId)?.focus();
        }, 500);
      }
    }
  };

  return (
    <section
      aria-label="Smart Investment Planner"
      className="relative mb-12 sm:mb-16 overflow-hidden rounded-[28px] sm:rounded-3xl border border-white/10 bg-cover bg-right bg-no-repeat px-6 py-5 text-white shadow-xl sm:px-10 sm:py-7 md:px-12 md:py-8"
      style={{ backgroundImage: `url(${heroBackground})` }}
    >
      <div className="relative z-10 w-full">
        {/* Pill Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white backdrop-blur-md shadow-sm">
          <Sparkles sx={{ fontSize: 14 }} className="text-blue-200" aria-hidden="true"  />
          <span>Smart Wealth Tools</span>
        </div>

        {/* Headline - Single Line */}
        <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-white sm:text-3xl md:text-4xl leading-tight">
          Smart Investment Planner
        </h1>

        {/* Subtitle */}
        <p className="mt-2 max-w-3xl text-sm font-normal leading-relaxed text-blue-100/85 sm:text-base md:text-lg">
          Calculate returns, learn the basics, and track your financial future.
        </p>

        {/* Stats Glassmorphic Bar - kept clear of the coin jar artwork on md+ */}
        <div className="mt-5 sm:mt-6 w-full md:max-w-[60%] grid grid-cols-3 divide-x divide-white/15 overflow-hidden rounded-2xl border border-white/20 bg-white/[0.08] backdrop-blur-md shadow-2xl">
          <button
            type="button"
            onClick={() => handleScroll('mf-calculators', undefined, onScrollToCalculators)}
            className="group flex flex-col items-center justify-center px-3 py-3 sm:px-4 sm:py-4 text-center transition-all duration-200 hover:bg-white/[0.12] active:scale-[0.99] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
          >
            <span className="text-2xl font-extrabold tracking-tight text-white transition-transform duration-200 group-hover:scale-105 sm:text-3xl">
              9
            </span>
            <span className="mt-0.5 text-xs font-semibold text-blue-200/90 sm:text-sm tracking-wide uppercase">
              Calculators
            </span>
            <span className="mt-1 hidden items-center gap-1 text-[11px] font-medium text-blue-200/60 transition-colors group-hover:text-white sm:inline-flex">
              Explore tools <span aria-hidden="true" className="transition-transform group-hover:translate-y-0.5">↓</span>
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleScroll('mf-faq-section', 'mf-search-input', onScrollToFaq)}
            className="group flex flex-col items-center justify-center px-3 py-3 sm:px-4 sm:py-4 text-center transition-all duration-200 hover:bg-white/[0.12] active:scale-[0.99] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
          >
            <span className="text-2xl font-extrabold tracking-tight text-white transition-transform duration-200 group-hover:scale-105 sm:text-3xl">
              FAQ
            </span>
            <span className="mt-0.5 text-xs font-semibold text-blue-200/90 sm:text-sm tracking-wide uppercase">
              Guides
            </span>
            <span className="mt-1 hidden items-center gap-1 text-[11px] font-medium text-blue-200/60 transition-colors group-hover:text-white sm:inline-flex">
              Browse questions <span aria-hidden="true" className="transition-transform group-hover:translate-y-0.5">↓</span>
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleScroll('mf-learning-section', undefined, onScrollToLearning)}
            className="group flex flex-col items-center justify-center px-3 py-3 sm:px-4 sm:py-4 text-center transition-all duration-200 hover:bg-white/[0.12] active:scale-[0.99] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
          >
            <span className="text-2xl font-extrabold tracking-tight text-white transition-transform duration-200 group-hover:scale-105 sm:text-3xl">
              MF
            </span>
            <span className="mt-0.5 text-xs font-semibold text-blue-200/90 sm:text-sm tracking-wide uppercase">
              Learning
            </span>
            <span className="mt-1 hidden items-center gap-1 text-[11px] font-medium text-blue-200/60 transition-colors group-hover:text-white sm:inline-flex">
              Read guides <span aria-hidden="true" className="transition-transform group-hover:translate-y-0.5">↓</span>
            </span>
          </button>
        </div>
      </div>
    </section>
  );
}
