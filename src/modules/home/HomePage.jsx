import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import HeroBannerCarousel from '../../components/home/HeroBannerCarousel';
import { fetchAllProducts, fetchBestSellers } from '../../api/productApi';
import ProductCard from '../../components/product/ProductCard';

// Service Images
import serviceHealth from '../../assets/home/service-health.png';
import serviceCar from '../../assets/home/service-car.png';
import servicePan from '../../assets/home/service-pan.png';
import servicePassport from '../../assets/home/service-passport.png';
import serviceTax from '../../assets/home/service-tax.png';
import serviceMutualFund from '../../assets/home/service-mutualfund.png';

// Payment Images
import paymentPrepaid from '../../assets/home/payment-prepaid.png';
import paymentPostpaid from '../../assets/home/payment-postpaid.png';
import paymentCreditCard from '../../assets/home/payment-creditcard.png';
import paymentElectricity from '../../assets/home/payment-electricity.png';
import paymentDth from '../../assets/home/payment-dth.png';
import paymentBroadband from '../../assets/home/payment-broadband.png';

// Promo Assets
import promoGiftBox from '../../assets/home/promo-giftbox.png';

// Material UI Icons
import StarIcon from '@mui/icons-material/Star';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SearchIcon from '@mui/icons-material/Search';
import TouchAppOutlinedIcon from '@mui/icons-material/TouchAppOutlined';
import CreditCardOutlinedIcon from '@mui/icons-material/CreditCardOutlined';
import CardGiftcardOutlinedIcon from '@mui/icons-material/CardGiftcardOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

// 1. SERVICES DATA WITH EXACT ROUTE MAPPINGS TO SERVICES MODULE
const SERVICES_DATA = [
  { id: 12, serviceId: 12, title: 'Health Insurance', titleLines: ['Health', 'Insurance'], image: serviceHealth, link: '/services/detail/12' },
  { id: 10, serviceId: 10, title: 'Car Insurance', titleLines: ['Car', 'Insurance'], image: serviceCar, link: '/services/detail/10' },
  { id: 1, serviceId: 1, title: 'PAN Card Services', titleLines: ['PAN Card', 'Services'], image: servicePan, link: '/services/detail/1' },
  { id: 3, categoryId: 3, title: 'Passport Services', titleLines: ['Passport', 'Services'], image: servicePassport, link: '/services/category/3' },
  { id: 13, serviceId: 13, title: 'Income Tax Return Filing', titleLines: ['Income Tax', 'Return Filing'], image: serviceTax, link: '/services/detail/13' },
  { id: 4, categoryId: 4, title: 'Mutual Fund Investment', titleLines: ['Mutual Fund', 'Investment'], image: serviceMutualFund, link: '/services/mutual-funds' },
];

// 2. FALLBACK PRODUCTS (USED DURING INITIAL LOAD OR NETWORK LIMITS)
const FALLBACK_PRODUCTS = [
  {
    id: 1319,
    title: 'Car Mobile Holder Grip Stand Black',
    product_name: 'Car Mobile Holder Grip Stand Black',
    rating: 4.6,
    reviews: 120,
    price: 543.76,
    mrp: 899.0,
    originalPrice: 899.0,
    discount: '40%',
    image: 'https://cdn.rewardplanners.com/public/products/27/1319/images/1788779032656-aoqbeg.webp',
    rewardCoins: 27,
    redeem_coins: 54,
  },
  {
    id: 1318,
    title: 'Mobile Stand Twistand 360',
    product_name: 'Mobile Stand Twistand 360',
    rating: 4.5,
    reviews: 89,
    price: 284.76,
    mrp: 699.0,
    originalPrice: 699.0,
    discount: '59%',
    image: 'https://cdn.rewardplanners.com/public/products/27/1318/images/1789103459582-2fz3u2.webp',
    rewardCoins: 14,
    redeem_coins: 28,
  },
  {
    id: 1315,
    title: 'Desktop USB Fan Airmate 01',
    product_name: 'Desktop USB Fan Airmate 01',
    rating: 4.4,
    reviews: 64,
    price: 541.04,
    mrp: 999.0,
    originalPrice: 999.0,
    discount: '46%',
    image: 'https://cdn.rewardplanners.com/public/products/27/1315/images/1788763145110-m7dhwi.webp',
    rewardCoins: 27,
    redeem_coins: 54,
  },
  {
    id: 1313,
    title: 'Wireless Mouse SLIQ3',
    product_name: 'Wireless Mouse SLIQ3',
    rating: 4.7,
    reviews: 215,
    price: 409.51,
    mrp: 599.0,
    originalPrice: 599.0,
    discount: '32%',
    image: 'https://cdn.rewardplanners.com/public/products/27/1313/images/1789103995325-q0nc5n.webp',
    rewardCoins: 20,
    redeem_coins: 40,
  },
];

// 3. PAYMENTS DATA
const PAYMENTS_DATA = [
  { id: 1, title: 'Mobile Prepaid', titleLines: ['Mobile', 'Prepaid'], image: paymentPrepaid, link: '/bbps?category=Mobile%20Prepaid' },
  { id: 2, title: 'Mobile Postpaid', titleLines: ['Mobile', 'Postpaid'], image: paymentPostpaid, link: '/bbps?category=Mobile%20Postpaid' },
  { id: 3, title: 'Credit Card Payment', titleLines: ['Credit Card', 'Payment'], image: paymentCreditCard, link: '/bbps?category=Credit%20Card' },
  { id: 4, title: 'Electricity Bill', titleLines: ['Electricity', 'Bill'], image: paymentElectricity, link: '/bbps?category=Electricity' },
  { id: 5, title: 'DTH Recharge', titleLines: ['DTH', 'Recharge'], image: paymentDth, link: '/bbps?category=DTH' },
  { id: 6, title: 'Broadband Bill', titleLines: ['Broadband', 'Bill'], image: paymentBroadband, link: '/bbps?category=Broadband' },
];

// 4. HOW IT WORKS DATA
const HOW_IT_WORKS_STEPS = [
  {
    step: '01',
    title: 'Explore',
    description: 'Find products, services or payment options.',
    icon: SearchIcon,
  },
  {
    step: '02',
    title: 'Choose',
    description: 'Select what you need.',
    icon: TouchAppOutlinedIcon,
  },
  {
    step: '03',
    title: 'Complete',
    description: 'Shop, access the service or make the payment.',
    icon: CreditCardOutlinedIcon,
  },
  {
    step: '04',
    title: 'Enjoy Rewards',
    description: 'Receive rewards and exclusive benefits.',
    icon: CardGiftcardOutlinedIcon,
  },
];

export const HomePage = () => {
  const { addItem, openCartDrawer } = useCart();
  const navigate = useNavigate();

  // Wishlist state
  const [wishlist, setWishlist] = useState({});
  // Toast notification state
  const [toastMessage, setToastMessage] = useState(null);

  // Dynamic Flash Deals State
  const [flashDeals, setFlashDeals] = useState(FALLBACK_PRODUCTS);
  const [productsLoading, setProductsLoading] = useState(true);

  // Live ticking countdown timer for Flash Deals (Ends in 04h : 32m : 18s)
  const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 32, seconds: 18 });
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 4, minutes: 32, seconds: 18 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch real dynamic flash deals products on mount
  useEffect(() => {
    let isMounted = true;
    setProductsLoading(true);

    Promise.allSettled([
      fetchAllProducts({ limit: 40 }),
      fetchBestSellers(),
    ])
      .then(([allRes, bsRes]) => {
        if (!isMounted) return;

        const all = allRes.status === 'fulfilled' && Array.isArray(allRes.value) ? allRes.value : [];
        const bs = bsRes.status === 'fulfilled' && Array.isArray(bsRes.value) && bsRes.value.length > 0
          ? bsRes.value
          : all.slice(0, 10);

        // Flash deals: products with highest discount percentage (> 15%)
        const highDiscount = all.filter((p) => {
          const disc = parseInt(String(p.discount || '').replace(/\D/g, ''), 10);
          return disc > 15;
        });

        const dealsList = highDiscount.length >= 4 ? highDiscount.slice(0, 5) : (bs.length > 0 ? bs.slice(0, 5) : FALLBACK_PRODUCTS);

        if (dealsList.length > 0) setFlashDeals(dealsList);

        setProductsLoading(false);
      })
      .catch(() => {
        if (isMounted) setProductsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const toggleWishlist = (productId) => {
    setWishlist((prev) => ({
      ...prev,
      [productId]: !prev[productId],
    }));
  };

  const handleAddToCart = (product) => {
    if (addItem) {
      addItem(
        {
          id: product.id,
          product_name: product.product_name || product.title,
          title: product.title || product.product_name,
          price: product.price,
          mrp: product.mrp || product.originalPrice,
          image: product.image,
        },
        1
      );
    }
    setToastMessage(`Added "${product.title || product.product_name}" to your cart!`);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-[#FDFCFE] font-['Poppins',sans-serif] text-slate-900 pb-16 space-y-12 sm:space-y-16 select-none">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl border border-slate-700 animate-fadeIn">
          <CheckCircleIcon sx={{ fontSize: 18 }} className="text-emerald-400" />
          <span className="text-xs font-semibold">{toastMessage}</span>
          <button
            onClick={() => {
              if (openCartDrawer) openCartDrawer();
            }}
            className="ml-2 text-xs text-purple-300 hover:text-white underline font-bold cursor-pointer"
          >
            View Cart
          </button>
        </div>
      )}

      {/* 1. HERO BANNER CAROUSEL */}
      <section className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 pt-3 sm:pt-5">
        <HeroBannerCarousel />
      </section>

      {/* 2. SERVICES SECTION WITH ACCURATE DYNAMIC NAVIGATION */}
      <section id="services" className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 scroll-mt-20">
        <div className="text-center space-y-1 mb-6 sm:mb-8">
          <span className="text-[#3814F0] font-black text-xs sm:text-[13px] tracking-[0.22em] uppercase block">
            Services
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-[32px] font-black text-[#0A0E54] tracking-tight leading-tight">
            Life's Essentials. All in One Place.
          </h2>
          <p className="text-xs sm:text-sm text-[#475569] font-normal">
            Access important services easily and get rewarded.
          </p>
        </div>

        {/* 6 Services Grid with Verified Detail & Category Routes */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
          {SERVICES_DATA.map((srv) => (
            <Link
              key={srv.id}
              to={srv.link}
              className="bg-white rounded-2xl border border-[#E2E8F0] p-3 sm:p-3.5 pb-3.5 sm:pb-4 flex flex-col items-center justify-between text-center shadow-[0_1px_4px_rgba(0,0,0,0.03)] hover:shadow-md hover:-translate-y-1 transition-all group"
            >
              <div className="w-full aspect-[4/3] rounded-xl overflow-hidden mb-2.5 flex items-center justify-center bg-slate-50/50">
                <img
                  src={srv.image}
                  alt={srv.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="flex flex-col items-center justify-center leading-tight">
                {srv.titleLines ? (
                  srv.titleLines.map((line, i) => (
                    <span
                      key={i}
                      className="text-xs sm:text-[13px] font-extrabold text-[#0A0E54] group-hover:text-[#3814F0] transition-colors"
                    >
                      {line}
                    </span>
                  ))
                ) : (
                  <span className="text-xs sm:text-[13px] font-extrabold text-[#0A0E54] group-hover:text-[#3814F0] transition-colors">
                    {srv.title}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. DYNAMIC FLASH DEALS / PRODUCTS SECTION */}
      <section id="products" className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 scroll-mt-20">
        <div className="text-center space-y-1 mb-6 sm:mb-8">
          <span className="text-[#3814F0] font-black text-xs sm:text-[13px] tracking-[0.22em] uppercase block">
            Products
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-[32px] font-black text-[#0A0E54] tracking-tight leading-tight">
            Flash Deals of the Day.
          </h2>
          <p className="text-xs sm:text-sm text-[#475569] font-normal">
            Shop the latest products and earn rewarding benefits.
          </p>
        </div>

        {/* FLASH DEALS OF THE DAY WITH LIVE COUNTDOWN TIMER */}
        <div className="bg-gradient-to-br from-rose-50/50 via-purple-50/30 to-amber-50/30 rounded-3xl p-4 sm:p-6 lg:p-7 border border-rose-100 shadow-xs">
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 sm:pb-5 border-b border-rose-100/80 gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-500 text-white flex items-center justify-center shadow-md shadow-rose-500/20 shrink-0">
                <WhatshotIcon sx={{ fontSize: 24 }} />
              </div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500 text-white shadow-xs">
                  Limited Time Offers
                </span>
                <p className="text-xs sm:text-sm text-slate-600 font-medium flex items-center gap-1.5">
                  <AccessTimeIcon sx={{ fontSize: 14 }} className="text-rose-600 shrink-0" />
                  <span>
                    Ends in{' '}
                    <strong className="text-rose-600 font-bold tracking-wider">
                      {String(timeLeft.hours).padStart(2, '0')}h : {String(timeLeft.minutes).padStart(2, '0')}m : {String(timeLeft.seconds).padStart(2, '0')}s
                    </strong>
                  </span>
                </p>
              </div>
            </div>

            <Link
              to="/deals"
              className="text-xs sm:text-sm font-bold text-[#5222E8] hover:text-[#4318D6] hover:underline flex items-center gap-1 self-start sm:self-auto shrink-0 group"
            >
              <span>View All Deals</span>
              <ChevronRightIcon sx={{ fontSize: 18 }} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {/* Flash Deals Cards Grid (Dynamic ProductCards with /product/:id navigation) */}
          <div className="pt-5">
            {productsLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-72 bg-white/80 rounded-2xl animate-pulse border border-slate-100" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                {flashDeals.map((prod) => (
                  <ProductCard key={`flash-${prod.id}`} item={prod} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 4. PAYMENTS SECTION */}
      <section className="w-full px-4 sm:px-6 lg:px-8 xl:px-10">
        <div className="text-center space-y-1 mb-6 sm:mb-8">
          <span className="text-[#3814F0] font-black text-xs sm:text-[13px] tracking-[0.22em] uppercase block">
            Payments
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-[32px] font-black text-[#0A0E54] tracking-tight leading-tight">
            Everyday Payments. Made Simple.
          </h2>
          <p className="text-xs sm:text-sm text-[#475569] font-normal">
            Recharge, pay bills and manage your payments — all in one place.
          </p>
        </div>

        {/* 6 Payments Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
          {PAYMENTS_DATA.map((pay) => (
            <Link
              key={pay.id}
              to={pay.link}
              className="bg-white rounded-2xl border border-[#E2E8F0] p-3.5 sm:p-4 flex flex-col items-center justify-between text-center shadow-[0_1px_4px_rgba(0,0,0,0.03)] hover:shadow-md hover:-translate-y-1 transition-all group"
            >
              {/* Floating icon without grey background */}
              <div className="w-full h-20 sm:h-24 flex items-center justify-center mb-2">
                <img
                  src={pay.image}
                  alt={pay.title}
                  className="max-h-14 sm:max-h-16 max-w-[85%] object-contain group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <div className="flex flex-col items-center justify-center leading-tight">
                {pay.titleLines ? (
                  pay.titleLines.map((line, i) => (
                    <span
                      key={i}
                      className="text-xs sm:text-[13px] font-extrabold text-[#0A0E54] group-hover:text-[#3814F0] transition-colors"
                    >
                      {line}
                    </span>
                  ))
                ) : (
                  <span className="text-xs sm:text-[13px] font-extrabold text-[#0A0E54] group-hover:text-[#3814F0] transition-colors">
                    {pay.title}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 5. PROMO BANNER RIBBON ("MORE VALUE EVERY DAY") */}
      <section className="w-full px-4 sm:px-6 lg:px-8 xl:px-10">
        <div className="relative w-full rounded-2xl sm:rounded-3xl p-6 sm:p-10 lg:p-12 xl:p-14 bg-gradient-to-r from-[#FDE7F3] via-[#E9D5FF] to-[#6366F1] shadow-xs overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Left Text */}
          <div className="space-y-1.5 text-center md:text-left z-10 max-w-md">
            <span className="text-[#E11D48] font-extrabold text-[11px] sm:text-xs tracking-wider uppercase block">
              Reward Planners
            </span>
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 leading-tight">
              More Value <span className="text-[#9333EA]">Every Day</span>
            </h3>
            <p className="text-xs sm:text-sm lg:text-base text-slate-700 font-medium">
              Shop, pay, access services and get rewarded – all in one place.
            </p>
          </div>

          {/* Center 3D Gift Box */}
          <div className="flex items-center justify-center z-10 shrink-0">
            <img
              src={promoGiftBox}
              alt="Up to 30% Off"
              className="h-22 sm:h-26 md:h-30 lg:h-34 w-auto object-contain drop-shadow-md"
            />
          </div>

          {/* Right Text & CTA Button */}
          <div className="flex flex-col items-center md:items-end text-center md:text-right z-10 space-y-3">
            <h4 className="text-white font-bold text-base sm:text-lg md:text-xl lg:text-2xl leading-tight drop-shadow-xs max-w-sm">
              Unlock a Smarter Way to Live and Save.
            </h4>
            <Link
              to="/store"
              className="inline-flex items-center gap-1.5 px-6 sm:px-7 lg:px-8 py-2 sm:py-2.5 lg:py-3 rounded-full bg-white hover:bg-slate-50 text-[#6D28D9] font-bold text-xs sm:text-sm lg:text-base shadow-md hover:scale-105 active:scale-95 transition-all"
            >
              <span>Explore Now</span>
              <ArrowForwardIcon sx={{ fontSize: 16 }} />
            </Link>
          </div>
        </div>
      </section>

      {/* 6. HOW IT WORKS SECTION */}
      <section className="w-full px-4 sm:px-6 lg:px-8 xl:px-10">
        <div className="text-center space-y-1 mb-8 sm:mb-10">
          <span className="text-[#3814F0] font-black text-xs sm:text-[13px] tracking-[0.22em] uppercase block">
            How It Works
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-[32px] font-black text-[#0A0E54] tracking-tight leading-tight">
            Everything Works Better Together.
          </h2>
          <p className="text-xs sm:text-sm text-[#475569] font-normal">
            From everyday needs to bigger goals — it's simple.
          </p>
        </div>

        {/* 4 Step Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-6 lg:gap-8">
          {HOW_IT_WORKS_STEPS.map((stepItem) => {
            const IconComp = stepItem.icon;
            return (
              <div
                key={stepItem.step}
                className="flex items-start gap-3.5 p-4 rounded-2xl bg-white/60 hover:bg-white border border-transparent hover:border-slate-100 hover:shadow-2xs transition-all"
              >
                {/* Purple Circular Icon Badge */}
                <div className="w-12 h-12 rounded-full bg-[#EDE9FE] text-[#7C3AED] flex items-center justify-center shrink-0 shadow-2xs">
                  <IconComp sx={{ fontSize: 24 }} />
                </div>

                {/* Step Content */}
                <div className="space-y-0.5 min-w-0">
                  <span className="text-[11px] font-extrabold text-[#7C3AED] tracking-wider block">
                    {stepItem.step}
                  </span>
                  <h3 className="font-bold text-[#0A0E54] text-sm sm:text-base leading-tight">
                    {stepItem.title}
                  </h3>
                  <p className="text-xs text-[#475569] leading-relaxed font-normal">
                    {stepItem.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
