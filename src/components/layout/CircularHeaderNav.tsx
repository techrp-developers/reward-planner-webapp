import React, { useState, useEffect, useRef, useCallback } from 'react';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

export interface HeaderModule {
  id: string;
  label: string;
  path: string;
}

export const HEADER_MODULES: HeaderModule[] = [
  { id: 'home', label: 'Dashboard', path: '/' },
  { id: 'services', label: 'Services', path: '/services' },
  { id: 'products', label: 'Products', path: '/store' },
  { id: 'payments', label: 'Payments', path: '/bbps' },
];

export const getModuleIndexFromPath = (path: string): number => {
  if (path === '/') return 0;
  if (path.startsWith('/services') || path === '/insurance' || path === '/tax') return 1;
  if (path.startsWith('/store') || path.startsWith('/deals') || path.startsWith('/product')) return 2;
  if (path.startsWith('/bbps')) return 3;
  return -1;
};

const N = HEADER_MODULES.length; // 4 modules
const VISIBLE_SLOTS = 3; // 3 visible modules in the carousel viewport
const REPEAT = 8; // 8 sets of 4 = 32 persistent items
const TOTAL_ITEMS = N * REPEAT; // 32 items total
const BASE_SET = 3; // Middle set starts at index 12 (Set 3: indices 12..15)

// 32 persistent items so DOM elements never get re-created or re-mounted
const RIBBON_ITEMS: { ribbonIndex: number; module: HeaderModule }[] = Array.from(
  { length: TOTAL_ITEMS },
  (_, idx) => ({
    ribbonIndex: idx,
    module: HEADER_MODULES[idx % N],
  })
);

interface CircularHeaderNavProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  isMobile?: boolean;
}

export const CircularHeaderNav: React.FC<CircularHeaderNavProps> = ({
  currentPath,
  onNavigate,
  isMobile = false,
}) => {
  const routeModIdx = getModuleIndexFromPath(currentPath);

  // Initial state:
  // If route is Dashboard (0), lead is BASE_SET * N (12), and activeSlot is 0 (Slot 0 is Dashboard)
  // If route is Services (1), lead is BASE_SET * N (12), and activeSlot is 1 (Slot 1 is Services)
  // Otherwise, place target module in center (Slot 1): lead = BASE_SET * N + (routeModIdx - 1)
  const initialLead =
    routeModIdx <= 1
      ? BASE_SET * N
      : BASE_SET * N + (((routeModIdx - 1) % N + N) % N);
  const initialSlot = routeModIdx <= 0 ? 0 : 1;

  const [trackLead, setTrackLead] = useState<number>(initialLead);
  const [activeSlot, setActiveSlot] = useState<number>(initialSlot);
  const [transitionEnabled, setTransitionEnabled] = useState<boolean>(true);

  const isAnimatingRef = useRef(false);
  const trackLeadRef = useRef(initialLead);
  const activeSlotRef = useRef(initialSlot);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const animTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  trackLeadRef.current = trackLead;
  activeSlotRef.current = activeSlot;

  // Clean slide function with boundary normalization
  const slideTrackTo = useCallback(
    (targetLead: number, targetPath?: string) => {
      if (animTimerRef.current) clearTimeout(animTimerRef.current);

      isAnimatingRef.current = true;
      setTransitionEnabled(true);
      setTrackLead(targetLead);
      trackLeadRef.current = targetLead;

      if (targetPath) {
        onNavigate(targetPath);
      }

      animTimerRef.current = setTimeout(() => {
        isAnimatingRef.current = false;

        // Normalization guard: only reset if we wander too far towards edges (< 8 or >= 24)
        if (targetLead >= (REPEAT - 2) * N || targetLead < 2 * N) {
          const offsetInCycle = ((targetLead % N) + N) % N;
          const normalizedLead = BASE_SET * N + offsetInCycle;

          const trackEl = trackRef.current;
          if (trackEl && normalizedLead !== targetLead) {
            setTransitionEnabled(false);
            setTrackLead(normalizedLead);
            trackLeadRef.current = normalizedLead;
            // Force browser reflow so new transform is applied instantaneously without animation
            void trackEl.offsetHeight;
            requestAnimationFrame(() => {
              setTransitionEnabled(true);
            });
          }
        }
      }, 280);
    },
    [onNavigate]
  );

  // Sync state when currentPath changes externally (e.g. browser back/forward or page banner clicks)
  useEffect(() => {
    if (isAnimatingRef.current) return;
    const matched = getModuleIndexFromPath(currentPath);
    if (matched === -1) return;

    const curLead = trackLeadRef.current;
    const curSlot = activeSlotRef.current;

    const s0 = ((curLead % N) + N) % N;
    const s1 = (((curLead + 1) % N) + N) % N;
    const s2 = (((curLead + 2) % N) + N) % N;

    // 1. Target is at Slot 0
    if (matched === s0) {
      if (matched === 0 && s1 === 1) {
        // [Dashboard, Services, Products] -> activate Slot 0
        if (curSlot !== 0) {
          setActiveSlot(0);
          activeSlotRef.current = 0;
        }
        return;
      }
      // Otherwise slide left by 1 so target module moves into center (Slot 1)
      setActiveSlot(1);
      activeSlotRef.current = 1;
      slideTrackTo(curLead - 1);
      return;
    }

    // 2. Target is at Slot 1 (Center)
    if (matched === s1) {
      if (curSlot !== 1) {
        setActiveSlot(1);
        activeSlotRef.current = 1;
      }
      return;
    }

    // 3. Target is at Slot 2 (Right)
    if (matched === s2) {
      setActiveSlot(1);
      activeSlotRef.current = 1;
      slideTrackTo(curLead + 1);
      return;
    }

    // 4. Target is outside currently visible slots
    if (matched === 0) {
      setActiveSlot(0);
      activeSlotRef.current = 0;
      slideTrackTo(BASE_SET * N);
    } else {
      setActiveSlot(1);
      activeSlotRef.current = 1;
      const targetLead = BASE_SET * N + (((matched - 1) % N + N) % N);
      slideTrackTo(targetLead);
    }
  }, [currentPath, slideTrackTo]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (animTimerRef.current) clearTimeout(animTimerRef.current);
    };
  }, []);

  // Handle clicking on any module tab
  const handleItemClick = (clickedRibbonIndex: number, mod: HeaderModule) => {
    const curLead = trackLeadRef.current;
    const curSlot = activeSlotRef.current;
    const slotPos = clickedRibbonIndex - curLead;

    // Ignore clicks outside the 3 visible slots
    if (slotPos < 0 || slotPos > 2) return;

    // Slot 1 (Center slot, e.g. Services in [Dashboard, Services, Products])
    // User requirement: "when i click on services that black selected card show for services and label remains as it is"
    if (slotPos === 1) {
      if (curSlot !== 1) {
        setActiveSlot(1);
        activeSlotRef.current = 1;
      }
      if (currentPath !== mod.path) {
        onNavigate(mod.path);
      }
      return;
    }

    // Slot 2 (Right slot, e.g. Products in [Dashboard, Services, Products])
    // User requirement: advance window by 1 so clicked module moves to center and next module appears on right
    if (slotPos === 2) {
      setActiveSlot(1);
      activeSlotRef.current = 1;
      slideTrackTo(curLead + 1, mod.path);
      return;
    }

    // Slot 0 (Left slot)
    if (slotPos === 0) {
      const isDashboardAtSlot0 = ((curLead % N) + N) % N === 0;

      // Special pristine case: If currently at [Dashboard, Services, Products] and user clicks Dashboard
      if (isDashboardAtSlot0 && mod.id === 'home') {
        setActiveSlot(0);
        activeSlotRef.current = 0;
        if (currentPath !== mod.path) {
          onNavigate(mod.path);
        }
        return;
      }

      // In all other cases: slide track left by 1 so clicked module moves into center (Slot 1)
      setActiveSlot(1);
      activeSlotRef.current = 1;
      slideTrackTo(curLead - 1, mod.path);
      return;
    }
  };

  // Chevron Right: rotate forward
  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const curLead = trackLeadRef.current;
    const curSlot = activeSlotRef.current;

    // If currently at [Dashboard(active), Services, Products] with activeSlot = 0:
    if (curSlot === 0 && ((curLead % N) + N) % N === 0) {
      setActiveSlot(1);
      activeSlotRef.current = 1;
      const mod = HEADER_MODULES[(((curLead + 1) % N) + N) % N];
      if (currentPath !== mod.path) {
        onNavigate(mod.path);
      }
      return;
    }

    // Otherwise advance track by 1 and activate new center module
    const targetLead = curLead + 1;
    setActiveSlot(1);
    activeSlotRef.current = 1;
    const targetMod = HEADER_MODULES[(((targetLead + 1) % N) + N) % N];
    slideTrackTo(targetLead, targetMod.path);
  };

  // Chevron Left: rotate backward
  const handlePrev = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const curLead = trackLeadRef.current;
    const curSlot = activeSlotRef.current;

    // If currently at [Dashboard, Services(active), Products] with activeSlot = 1:
    if (curSlot === 1 && ((curLead % N) + N) % N === 0) {
      setActiveSlot(0);
      activeSlotRef.current = 0;
      const mod = HEADER_MODULES[((curLead % N) + N) % N];
      if (currentPath !== mod.path) {
        onNavigate(mod.path);
      }
      return;
    }

    // Otherwise move track left by 1 and activate new center module
    const targetLead = curLead - 1;
    setActiveSlot(1);
    activeSlotRef.current = 1;
    const targetMod = HEADER_MODULES[(((targetLead + 1) % N) + N) % N];
    slideTrackTo(targetLead, targetMod.path);
  };

  // Track percentage translation
  const trackTranslateX = (trackLead * 100) / TOTAL_ITEMS;

  return (
    <nav
      className={`relative bg-white/95 backdrop-blur-md rounded-full border border-[#E2E8F0] shadow-[0_2px_14px_rgba(15,23,42,0.06)] flex items-center select-none w-full ${
        isMobile ? 'p-1' : 'p-1'
      }`}
      role="navigation"
      aria-label="Main Module Carousel"
    >
      {/* Circular Rotate Left Chevron Button */}
      <button
        type="button"
        onClick={handlePrev}
        data-action="prev"
        className={`rounded-full flex items-center justify-center text-[#1C0E28] hover:bg-slate-100 active:scale-95 transition-all shrink-0 cursor-pointer focus:outline-none z-20 ${
          isMobile ? 'w-6 h-6' : 'w-7 h-7'
        }`}
        title="Previous Module"
        aria-label="Previous module"
      >
        <ChevronLeftIcon sx={{ fontSize: isMobile ? 18 : 19 }} />
      </button>

      {/* 3-Module Visible Viewport Window */}
      <div className="overflow-hidden flex-1 relative rounded-full mx-0.5">
        {/* Floating Smooth Sliding Active Pill Indicator */}
        <div
          className="absolute top-0.5 bottom-0.5 rounded-full bg-[#1C0E28] shadow-sm pointer-events-none z-0"
          style={{
            width: 'calc(33.3333% - 4px)',
            left: `calc(${activeSlot * 33.3333}% + 2px)`,
            transition: 'left 260ms cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        />

        {/* Sliding Multi-Module Track */}
        <div
          ref={trackRef}
          className="flex items-center relative z-10"
          style={{
            width: `${(TOTAL_ITEMS / VISIBLE_SLOTS) * 100}%`,
            transform: `translate3d(-${trackTranslateX}%, 0, 0)`,
            transition: transitionEnabled
              ? 'transform 280ms cubic-bezier(0.22, 1, 0.36, 1)'
              : 'none',
            willChange: 'transform',
          }}
        >
          {RIBBON_ITEMS.map((item) => {
            const slotPos = item.ribbonIndex - trackLead;
            const isVisibleSlot = slotPos >= 0 && slotPos < VISIBLE_SLOTS;
            const isActive = isVisibleSlot && slotPos === activeSlot;

            return (
              <div
                key={`ribbon-slot-${item.ribbonIndex}`}
                style={{ width: `${100 / TOTAL_ITEMS}%` }}
                className="flex-shrink-0 px-0.5 sm:px-1 box-border"
              >
                <button
                  type="button"
                  data-slot={isVisibleSlot ? slotPos : undefined}
                  data-module={item.module.id}
                  data-index={item.ribbonIndex}
                  onClick={() => handleItemClick(item.ribbonIndex, item.module)}
                  className={`w-full rounded-full text-center tracking-tight transition-colors duration-250 cursor-pointer flex items-center justify-center select-none ${
                    isMobile
                      ? 'py-1 px-1 text-xs font-bold'
                      : 'py-1 sm:py-1.5 px-2 text-xs sm:text-sm font-bold'
                  } ${
                    isActive
                      ? 'text-white font-extrabold'
                      : 'text-[#111827] hover:text-black hover:bg-slate-100/50 font-bold'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <span className="truncate">{item.module.label}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Circular Rotate Right Chevron Button */}
      <button
        type="button"
        onClick={handleNext}
        data-action="next"
        className={`rounded-full flex items-center justify-center text-[#1C0E28] hover:bg-slate-100 active:scale-95 transition-all shrink-0 cursor-pointer focus:outline-none z-20 ${
          isMobile ? 'w-6 h-6' : 'w-7 h-7'
        }`}
        title="Next Module"
        aria-label="Next module"
      >
        <ChevronRightIcon sx={{ fontSize: isMobile ? 18 : 19 }} />
      </button>
    </nav>
  );
};

export default CircularHeaderNav;
