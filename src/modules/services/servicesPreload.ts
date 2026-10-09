import heroSmall from '../../assets/servicescards/optimized/banner-itr-new-320.avif';
import heroMedium from '../../assets/servicescards/optimized/banner-itr-new-640.avif';
import heroLarge from '../../assets/servicescards/optimized/banner-itr-new-1280.avif';

export const loadServicesHome = () => import('./ServicesPage');
export function preloadServicesHome() {
  void loadServicesHome().catch(() => { /* The route boundary handles an actual navigation failure. */ });
  if (document.querySelector('link[data-service-hero]')) return;
  // The existing local carousel starts with this banner. Discover its responsive image
  // while session hydration and the route chunk load, instead of after React renders it.
  const link = document.createElement('link');
  link.rel = 'preload'; link.as = 'image'; link.type = 'image/avif';
  link.href = heroLarge;
  link.setAttribute('imagesrcset', `${heroSmall} 320w, ${heroMedium} 640w, ${heroLarge} 1024w`);
  link.setAttribute('imagesizes', '(min-width: 1600px) 1500px, 100vw');
  link.dataset.serviceHero = 'true';
  document.head.append(link);
}
