// src/modules/stage/CinematicModuleStage.jsx
import React, { lazy, Suspense, useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
const HomePage = lazy(() => import('../home/HomePage'));
const ProductListingPage = lazy(() => import('../ecommerce/ProductListingPage'));
import { loadServicesHome } from '../services/servicesPreload';
const ServicesPage = lazy(loadServicesHome);
const BBPSPage = lazy(() => import('../bbps/BBPSPage'));
import './CinematicModuleStage.css';

function getModuleIndex(pathname: string) {
  if (pathname.startsWith('/services')) return 1;
  if (pathname.startsWith('/store') || pathname.startsWith('/deals')) return 2;
  if (pathname.startsWith('/bbps')) return 3;
  return 0; // Default to Dashboard ('/')
}

export default function CinematicModuleStage() {
  const location = useLocation();
  const targetIndex = getModuleIndex(location.pathname);
  const [activeIndex, setActiveIndex] = useState(targetIndex);
  const [visited, setVisited] = useState(() => new Set([targetIndex]));
  useEffect(() => { setVisited(current => current.has(activeIndex) ? current : new Set([...current, activeIndex])); }, [activeIndex]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const viewportRef = useRef(null);
  const hasMounted = useRef(false);

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      setActiveIndex(targetIndex);
      return;
    }

    if (targetIndex !== activeIndex) {
      setIsTransitioning(true);
      setActiveIndex(targetIndex);
      if (viewportRef.current) {
        viewportRef.current.scrollLeft = 0;
      }
      const timer = setTimeout(() => {
        setIsTransitioning(false);
        if (viewportRef.current) {
          viewportRef.current.scrollLeft = 0;
        }
      }, 320);
      return () => clearTimeout(timer);
    }
  }, [targetIndex, activeIndex]);

  const handleViewportScroll = () => {
    if (viewportRef.current && viewportRef.current.scrollLeft !== 0) {
      viewportRef.current.scrollLeft = 0;
    }
  };

  return (
    <div
      ref={viewportRef}
      onScroll={handleViewportScroll}
      className={`cinematic-stage-viewport ${isTransitioning ? 'is-animating' : ''}`}
    >
      <div
        className="cinematic-stage-track"
        style={{
          transform: `translate3d(-${activeIndex * 100}%, 0, 0)`,
        }}
      >
        {/* Screen 0: Dashboard */}
        <div
          className={`cinematic-stage-screen screen-dashboard no-scrollbar ${activeIndex === 0 ? 'is-active' : ''}`}
          aria-hidden={activeIndex !== 0}
          inert={activeIndex !== 0}
        >
          {visited.has(0) && <Suspense fallback={<div role="status" className="p-8">Loading dashboard...</div>}><HomePage /></Suspense>}
        </div>

        {/* Screen 1: Services */}
        <div
          className={`cinematic-stage-screen screen-services no-scrollbar ${activeIndex === 1 ? 'is-active' : ''}`}
          aria-hidden={activeIndex !== 1}
          inert={activeIndex !== 1}
        >
          {visited.has(1) && <Suspense fallback={<div role="status" className="p-8">Loading services...</div>}><ServicesPage /></Suspense>}
        </div>

        {/* Screen 2: Products */}
        <div
          className={`cinematic-stage-screen screen-products no-scrollbar ${activeIndex === 2 ? 'is-active' : ''}`}
          aria-hidden={activeIndex !== 2}
          inert={activeIndex !== 2}
        >
          {visited.has(2) && <Suspense fallback={<div role="status" className="p-8">Loading store...</div>}><ProductListingPage /></Suspense>}
        </div>

        {/* Screen 3: Payments */}
        <div
          className={`cinematic-stage-screen screen-payments no-scrollbar ${activeIndex === 3 ? 'is-active' : ''}`}
          aria-hidden={activeIndex !== 3}
          inert={activeIndex !== 3}
        >
          {visited.has(3) && <Suspense fallback={<div role="status" className="p-8">Loading payments...</div>}><BBPSPage /></Suspense>}
        </div>
      </div>
    </div>
  );
}
