// src/modules/stage/CinematicModuleStage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import HomePage from '../home/HomePage';
import ProductListingPage from '../ecommerce/ProductListingPage';
import ServicesPage from '../services/ServicesPage';
import BBPSPage from '../bbps/BBPSPage';
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
        >
          <HomePage />
        </div>

        {/* Screen 1: Services */}
        <div
          className={`cinematic-stage-screen screen-services no-scrollbar ${activeIndex === 1 ? 'is-active' : ''}`}
          aria-hidden={activeIndex !== 1}
        >
          <ServicesPage />
        </div>

        {/* Screen 2: Products */}
        <div
          className={`cinematic-stage-screen screen-products no-scrollbar ${activeIndex === 2 ? 'is-active' : ''}`}
          aria-hidden={activeIndex !== 2}
        >
          <ProductListingPage />
        </div>

        {/* Screen 3: Payments */}
        <div
          className={`cinematic-stage-screen screen-payments no-scrollbar ${activeIndex === 3 ? 'is-active' : ''}`}
          aria-hidden={activeIndex !== 3}
        >
          <BBPSPage />
        </div>
      </div>
    </div>
  );
}
