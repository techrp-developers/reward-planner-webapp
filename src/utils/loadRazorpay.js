// Utility to dynamically load Razorpay Checkout script if not already present
let razorpayPromise = null;

export const loadRazorpay = () => {
  if (typeof window === 'undefined') return Promise.resolve(null);
  if (window.Razorpay) return Promise.resolve(window.Razorpay);

  if (!razorpayPromise) {
    razorpayPromise = new Promise((resolve, reject) => {
      const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
      if (existingScript) {
        existingScript.addEventListener('load', () => resolve(window.Razorpay));
        existingScript.addEventListener('error', () => reject(new Error('Failed to load Razorpay SDK')));
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => {
        resolve(window.Razorpay);
      };
      script.onerror = () => {
        razorpayPromise = null;
        reject(new Error('Failed to load Razorpay SDK'));
      };
      document.body.appendChild(script);
    });
  }

  return razorpayPromise;
};
