// src/components/layout/Footer.jsx
// Dark Navy Theme Footer matching Reward Planners reference design
import React from 'react';
import { Link } from 'react-router-dom';
import rpLogo from '../../assets/rp_logo_crisp.png';

// Material UI Icons
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import TwitterIcon from '@mui/icons-material/Twitter';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import YouTubeIcon from '@mui/icons-material/YouTube';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

export const Footer = () => {
  return (
    <footer className="w-full bg-[#0B0E23] text-white border-t border-slate-800/90 font-['Poppins',sans-serif] select-none">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 pt-12 pb-8">
        {/* Main Grid: Brand Column + 6 Link Columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-8 sm:gap-6">
          {/* Brand Info Column (spans 1 col on lg, 2 on sm) */}
          <div className="col-span-2 sm:col-span-2 md:col-span-4 lg:col-span-1 space-y-4">
            <Link to="/" className="flex items-center gap-2.5 group">
              <img
                src={rpLogo}
                alt="Reward Planners"
                className="h-9 w-auto max-h-[38px] object-contain group-hover:scale-105 transition-transform"
              />
              <div className="flex flex-col text-left leading-none">
                <span className="font-extrabold text-white text-base tracking-tight leading-tight">Reward</span>
                <span className="font-extrabold text-white text-base tracking-tight leading-tight">Planners</span>
              </div>
            </Link>

            <p className="text-sm text-slate-400 leading-relaxed max-w-xs font-normal">
              Plan. Shop. Pay. Earn. A Better Everyday.
            </p>

            {/* Social Icons Row */}
            <div className="flex items-center gap-2.5 pt-1">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="w-8 h-8 rounded-full bg-slate-800/90 hover:bg-[#7C3AED] text-slate-300 hover:text-white flex items-center justify-center transition-all hover:scale-110"
              >
                <FacebookIcon sx={{ fontSize: 18 }} />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="w-8 h-8 rounded-full bg-slate-800/90 hover:bg-[#7C3AED] text-slate-300 hover:text-white flex items-center justify-center transition-all hover:scale-110"
              >
                <InstagramIcon sx={{ fontSize: 18 }} />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Twitter / X"
                className="w-8 h-8 rounded-full bg-slate-800/90 hover:bg-[#7C3AED] text-slate-300 hover:text-white flex items-center justify-center transition-all hover:scale-110"
              >
                <TwitterIcon sx={{ fontSize: 18 }} />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
                className="w-8 h-8 rounded-full bg-slate-800/90 hover:bg-[#7C3AED] text-slate-300 hover:text-white flex items-center justify-center transition-all hover:scale-110"
              >
                <LinkedInIcon sx={{ fontSize: 18 }} />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                aria-label="YouTube"
                className="w-8 h-8 rounded-full bg-slate-800/90 hover:bg-[#7C3AED] text-slate-300 hover:text-white flex items-center justify-center transition-all hover:scale-110"
              >
                <YouTubeIcon sx={{ fontSize: 18 }} />
              </a>
            </div>
          </div>

          {/* 1. Products Column */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">Products</h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>
                <Link to="/store" className="hover:text-white transition-colors">
                  Shop
                </Link>
              </li>
              <li>
                <Link to="/store?view=all" className="hover:text-white transition-colors">
                  Categories
                </Link>
              </li>
              <li>
                <Link to="/deals" className="hover:text-white transition-colors">
                  Offers
                </Link>
              </li>
              <li>
                <Link to="/deals" className="hover:text-white transition-colors">
                  Deals
                </Link>
              </li>
            </ul>
          </div>

          {/* 2. Services Column */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">Services</h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>
                <Link to="/services" className="hover:text-white transition-colors">
                  Insurance
                </Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-white transition-colors">
                  Government Documents
                </Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-white transition-colors">
                  Tax Services
                </Link>
              </li>
              <li>
                <Link to="/services/mutual-funds" className="hover:text-white transition-colors">
                  Financial Services
                </Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-white transition-colors">
                  Utility Services
                </Link>
              </li>
            </ul>
          </div>

          {/* 3. Payments Column */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">Payments</h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>
                <Link to="/bbps?category=Mobile%20Prepaid" className="hover:text-white transition-colors">
                  Mobile Recharges
                </Link>
              </li>
              <li>
                <Link to="/bbps" className="hover:text-white transition-colors">
                  Bill Payments
                </Link>
              </li>
              <li>
                <Link to="/bbps?category=Credit%20Card" className="hover:text-white transition-colors">
                  Credit Card
                </Link>
              </li>
              <li>
                <Link to="/bbps" className="hover:text-white transition-colors">
                  More Payments
                </Link>
              </li>
            </ul>
          </div>

          {/* 4. Company Column */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">Company</h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>
                <Link to="/terms" className="hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/support-policy" className="hover:text-white transition-colors">
                  Careers
                </Link>
              </li>
              <li>
                <Link to="/support-policy" className="hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* 5. Support Column */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">Support</h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>
                <Link to="/support-policy" className="hover:text-white transition-colors">
                  Help Centre
                </Link>
              </li>
              <li>
                <Link to="/support-policy" className="hover:text-white transition-colors">
                  FAQs
                </Link>
              </li>
              <li>
                <Link to="/support-policy" className="hover:text-white transition-colors">
                  Customer Support
                </Link>
              </li>
            </ul>
          </div>

          {/* 6. Legal Column */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">Legal</h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>
                <Link to="/terms" className="hover:text-white transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/refund-cancellation-policy" className="hover:text-white transition-colors">
                  Refunds & Cancellation
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Security Badges */}
        <div className="border-t border-slate-800/80 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-sm text-slate-400 gap-3">
          <div>
            © 2024 Reward Planners. All rights reserved.
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <LockOutlinedIcon sx={{ fontSize: 17 }} className="text-[#A855F7]" />
            <span>Secure | Trusted | Rewarding</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
