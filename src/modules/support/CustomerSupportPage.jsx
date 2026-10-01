// src/modules/support/CustomerSupportPage.jsx
// Complete Customer Support & Corporate Help Desk Page
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import EmployeeSidebar from '../home/components/EmployeeSidebar';
import pageBgAurora from '../../assets/page_bg_aurora.png';
import {
  fetchSupportCategories,
  createSupportTicket,
  fetchSupportTickets,
  DEFAULT_SUPPORT_CATEGORIES,
} from '../../api/supportApi';

// Lucide & Material Icons
import {
  HelpCircle,
  PhoneCall,
  Mail,
  MessageSquare,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Send,
  FileText,
  LifeBuoy,
  PlusCircle,
  Sparkles,
  ArrowRight,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import HeadphonesOutlinedIcon from '@mui/icons-material/HeadphonesOutlined';
import SupportAgentOutlinedIcon from '@mui/icons-material/SupportAgentOutlined';

const FAQS = [
  {
    q: 'How do I redeem my Reward Points?',
    a: 'You can redeem your reward points directly at checkout in our Store for physical products, or apply them towards eligible corporate wellness programs, gift vouchers, and utility payments via BBPS.',
  },
  {
    q: 'When will my e-Commerce order or reward voucher be delivered?',
    a: 'Physical product orders are typically dispatched within 24–48 business hours and delivered within 4–7 business days. Digital vouchers and coupon codes are sent instantly to your registered work email and SMS.',
  },
  {
    q: 'How do I submit an insurance claim under GMC/GPA benefits?',
    a: 'Go to "My Benefits" > "Health Insurance", click on "Submit Claim", and provide the hospital admission summary, diagnostic bills, and discharge report. Our claims relationship team will review and process your cashless or reimbursement claim.',
  },
  {
    q: 'What should I do if my BBPS utility payment failed or was debited twice?',
    a: 'BBPS payments are processed securely through NPCI. If the amount was debited but the bill was not updated, it will automatically reverse within 3–5 business days. You can also raise a ticket here selecting "BBPS & Bill Payments" with your transaction reference number.',
  },
  {
    q: 'How do I sync my daily steps with the Wellness Leaderboard?',
    a: 'Navigate to "Health & Wellness" > "Step Challenge" and grant read permissions to Google Fit or Health Connect. Your steps will automatically synchronize hourly to keep your streak and rewards up to date.',
  },
  {
    q: 'Can I change my registered work email or phone number?',
    a: 'For security and compliance with your organization\'s HRMS portal, official email updates must be initiated by your company HR Administrator or through our corporate support desk.',
  },
];

export const CustomerSupportPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'ticket';

  const [activeTab, setActiveTab] = useState(initialTab === 'tickets' ? 'history' : initialTab === 'faq' ? 'faq' : 'ticket');
  const [categories, setCategories] = useState(DEFAULT_SUPPORT_CATEGORIES);
  const [tickets, setTickets] = useState([]);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [lastCreatedId, setLastCreatedId] = useState('');
  const [expandedFaq, setExpandedFaq] = useState(0);

  // Form State
  const [formData, setFormData] = useState({
    category_id: 1,
    category_name: 'Reward Points & Redemptions',
    support_module: 'general',
    subject: '',
    description: '',
    reference_id: '',
    attachment_name: '',
  });
  const [errorMsg, setErrorMsg] = useState('');

  // Load Categories & Tickets on Mount
  useEffect(() => {
    let isMounted = true;

    fetchSupportCategories().then((cats) => {
      if (isMounted && Array.isArray(cats) && cats.length > 0) {
        setCategories(cats);
        setFormData((prev) => ({
          ...prev,
          category_id: cats[0].category_id,
          category_name: cats[0].name,
        }));
      }
    });

    setLoadingTickets(true);
    fetchSupportTickets()
      .then((data) => {
        if (isMounted) setTickets(data);
      })
      .finally(() => {
        if (isMounted) setLoadingTickets(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleCategoryChange = (e) => {
    const selectedId = Number(e.target.value);
    const cat = categories.find((c) => c.category_id === selectedId);
    setFormData((prev) => ({
      ...prev,
      category_id: selectedId,
      category_name: cat ? cat.name : 'General Support',
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        attachment_name: file.name,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.subject.trim()) {
      setErrorMsg('Please enter a brief subject for your support request.');
      return;
    }
    if (!formData.description.trim() || formData.description.trim().length < 10) {
      setErrorMsg('Please provide a detailed description (at least 10 characters) to help us resolve your issue.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await createSupportTicket({
        category_id: formData.category_id,
        category_name: formData.category_name,
        support_module: formData.support_module,
        subject: formData.subject.trim(),
        description: formData.description.trim(),
        attachment_name: formData.attachment_name,
      });

      if (res.success && res.ticket) {
        setTickets((prev) => [res.ticket, ...prev]);
        setLastCreatedId(res.ticket.ticket_id);
        setSubmitSuccess(true);
        // Reset form
        setFormData((prev) => ({
          ...prev,
          subject: '',
          description: '',
          reference_id: '',
          attachment_name: '',
        }));
      }
    } catch (err) {
      setErrorMsg('Failed to submit ticket. Please try again or reach out via our direct helpline.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex w-full min-h-[calc(100vh-4.25rem)] bg-[#F8FAFC]">
      {/* ── 1. EMPLOYEE SIDEBAR WITH ACTIVE SUPPORT TAB ── */}
      <EmployeeSidebar activeTab="support" />

      {/* ── 2. MAIN CONTENT AREA (WITH AURORA BACKGROUND) ── */}
      <div
        className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto space-y-6"
        style={{
          backgroundImage: `url(${pageBgAurora})`,
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center top',
        }}
      >
        {/* Header Title & Intro Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200/80 pb-5">
          <div className="space-y-1">
            <nav className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-slate-500 mb-0.5" aria-label="Breadcrumb">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="hover:text-[#6D28D9] transition-colors cursor-pointer"
              >
                Home
              </button>
              <ChevronRight size={13} className="text-slate-400" />
              <span className="text-[#111827] font-semibold">Help &amp; Support</span>
            </nav>

            <h1 className="text-2xl sm:text-3xl font-black text-[#111827] tracking-tight leading-tight">
              Help &amp; <span className="text-[#6D28D9]">Support</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 font-medium pt-0.5">
              We're here to assist you with reward points, store deliveries, employee benefits, BBPS payments, and platform queries.
            </p>
          </div>

          {/* Quick SLA Badge */}
          <div className="flex items-center gap-3 bg-white/90 backdrop-blur-sm border border-purple-100 rounded-2xl px-4 py-2.5 shadow-xs shrink-0">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-[#7C3AED] flex items-center justify-center font-bold">
              <Clock size={19} />
            </div>
            <div className="text-left">
              <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Average Response Time</div>
              <div className="text-xs sm:text-sm font-extrabold text-gray-900">&lt; 24 Business Hours</div>
            </div>
          </div>
        </div>

        {/* ── 3. FOUR QUICK CONTACT CHANNELS CARDS ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Toll Free Call */}
          <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-gray-200/80 p-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <PhoneCall size={20} />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-[#0A0A5C]">Toll-Free Helpline</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Direct phone support for immediate issues & redemption assistance.
              </p>
            </div>
            <div className="pt-3 mt-2 border-t border-gray-100">
              <a
                href="tel:+918660583751"
                className="inline-flex items-center gap-1.5 text-xs sm:text-[13px] font-bold text-blue-600 hover:text-blue-800 transition-colors"
              >
                <span>+91 8660 583751</span>
                <ExternalLink size={13} />
              </a>
              <div className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5">Mon–Sat: 9:00 AM – 7:00 PM</div>
            </div>
          </div>

          {/* Card 2: Email Desk */}
          <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-gray-200/80 p-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Mail size={20} />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-[#0A0A5C]">Email Help Desk</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Send official inquiries, bill attachments, and corporate requests.
              </p>
            </div>
            <div className="pt-3 mt-2 border-t border-gray-100">
              <a
                href="mailto:support@rewardplanners.com"
                className="inline-flex items-center gap-1.5 text-xs sm:text-[13px] font-bold text-purple-600 hover:text-purple-800 transition-colors truncate max-w-full"
              >
                <span className="truncate">support@rewardplanners.com</span>
                <ExternalLink size={13} className="shrink-0" />
              </a>
              <div className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5">SLA: Under 24 Business Hours</div>
            </div>
          </div>

          {/* Card 3: WhatsApp Support */}
          <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-gray-200/80 p-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <MessageSquare size={20} />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-[#0A0A5C]">WhatsApp Corporate</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Chat directly with our verified relationship desk on WhatsApp.
              </p>
            </div>
            <div className="pt-3 mt-2 border-t border-gray-100">
              <a
                href="https://wa.me/918660583751?text=Hi%20Reward%20Planners%20Support,%20I%20need%20help%20with%20my%20account."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs sm:text-[13px] font-bold text-emerald-600 hover:text-emerald-800 transition-colors"
              >
                <span>Start WhatsApp Chat</span>
                <ExternalLink size={13} />
              </a>
              <div className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5">Fastest reply for quick Qs</div>
            </div>
          </div>

          {/* Card 4: Corporate Governance & Policy */}
          <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-gray-200/80 p-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <ShieldCheck size={20} />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-[#0A0A5C]">Grievance & Policies</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Read our formal Support & Grievance redressal policy and commitments.
              </p>
            </div>
            <div className="pt-3 mt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => navigate('/support-policy')}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 hover:text-amber-800 transition-colors cursor-pointer"
              >
                <span>View Support Policy</span>
                <ArrowRight size={13} />
              </button>
              <div className="text-[10px] text-gray-400 mt-0.5">Compliant SLA Governance</div>
            </div>
          </div>
        </div>

        {/* ── 4. MAIN INTERACTIVE TABS (RAISE TICKET | MY TICKETS | FAQS) ── */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-gray-200/90 shadow-sm overflow-hidden">
          {/* Tabs Navigation Bar */}
          <div className="flex border-b border-gray-200 px-4 sm:px-6 pt-3 gap-2 overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => {
                setActiveTab('ticket');
                setSubmitSuccess(false);
              }}
              className={`flex items-center gap-2 pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer shrink-0 ${
                activeTab === 'ticket'
                  ? 'border-[#7C3AED] text-[#7C3AED]'
                  : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              <PlusCircle size={16} />
              <span>Raise Support Ticket</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer shrink-0 ${
                activeTab === 'history'
                  ? 'border-[#7C3AED] text-[#7C3AED]'
                  : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              <FileText size={16} />
              <span>My Support Tickets</span>
              {tickets.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-100 text-purple-700">
                  {tickets.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('faq')}
              className={`flex items-center gap-2 pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer shrink-0 ${
                activeTab === 'faq'
                  ? 'border-[#7C3AED] text-[#7C3AED]'
                  : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              <HelpCircle size={16} />
              <span>Frequently Asked Questions</span>
            </button>
          </div>

          {/* TAB 1: RAISE SUPPORT TICKET */}
          {activeTab === 'ticket' && (
            <div className="p-5 sm:p-7">
              {submitSuccess ? (
                <div className="p-6 text-center max-w-lg mx-auto space-y-4 animate-fadeIn">
                  <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 size={32} />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-black text-gray-900">Support Ticket Created!</h3>
                    <p className="text-xs sm:text-sm text-gray-600">
                      Your ticket reference number is{' '}
                      <span className="font-extrabold text-[#7C3AED]">{lastCreatedId}</span>. Our corporate relationship team will review your query and get back within 24 business hours.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab('history')}
                      className="px-5 py-2.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                    >
                      View in My Tickets
                    </button>
                    <button
                      type="button"
                      onClick={() => setSubmitSuccess(false)}
                      className="px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition-all cursor-pointer"
                    >
                      Submit Another Query
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5 max-w-3xl">
                  {errorMsg && (
                    <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
                      <AlertCircle size={16} className="shrink-0 text-rose-500" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  {/* Row 1: Category & Module Selection */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-700">Issue Category *</label>
                      <select
                        value={formData.category_id}
                        onChange={handleCategoryChange}
                        className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all cursor-pointer"
                      >
                        {categories.map((cat) => (
                          <option key={cat.category_id} value={cat.category_id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-700">Relevant Module</label>
                      <select
                        value={formData.support_module}
                        onChange={(e) => setFormData((prev) => ({ ...prev, support_module: e.target.value }))}
                        className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all cursor-pointer"
                      >
                        <option value="general">General Platform Inquiry</option>
                        <option value="ecommerce">Store Order / Physical Product</option>
                        <option value="benefits">Corporate Benefits & Health Claims</option>
                        <option value="wellness">Wellness Challenges & Streaks</option>
                        <option value="events">Events & Registrations</option>
                        <option value="bbps">BBPS Bill Payment</option>
                        <option value="profile">Profile / KYC Verification</option>
                      </select>
                    </div>
                  </div>

                  {/* Row 2: Subject */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700">Subject / Brief Summary *</label>
                    <input
                      type="text"
                      placeholder="e.g. Question regarding recent points redemption for fitness challenge"
                      value={formData.subject}
                      onChange={(e) => setFormData((prev) => ({ ...prev, subject: e.target.value }))}
                      className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all"
                    />
                  </div>

                  {/* Row 3: Description */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700">Detailed Message / Description *</label>
                    <textarea
                      rows={5}
                      placeholder="Please describe your issue in detail. Include any order numbers, claim references, or error messages encountered."
                      value={formData.description}
                      onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                      className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all resize-y"
                    />
                  </div>

                  {/* Row 4: Attachment & Reference */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-700">Order ID or Claim Reference (Optional)</label>
                      <input
                        type="text"
                        placeholder="e.g. ORD-10924 or CLM-4421"
                        value={formData.reference_id}
                        onChange={(e) => setFormData((prev) => ({ ...prev, reference_id: e.target.value }))}
                        className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-700">Attach Screenshot or Document (Optional)</label>
                      <label className="w-full flex items-center justify-between border border-dashed border-gray-300 rounded-xl px-3.5 py-2 text-xs text-gray-600 bg-gray-50/70 hover:bg-gray-100 transition-colors cursor-pointer">
                        <span className="truncate max-w-[200px]">
                          {formData.attachment_name || 'Upload file (PNG, JPG, PDF)'}
                        </span>
                        <span className="px-2 py-1 rounded-md bg-white border border-gray-200 text-[11px] font-bold text-gray-700 shrink-0">
                          Browse
                        </span>
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  {/* Submit Action */}
                  <div className="pt-3 flex items-center justify-between">
                    <p className="text-[11px] text-gray-500">
                      Your ticket is confidential and handled in compliance with corporate privacy standards.
                    </p>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#6D28D9] to-[#EC4899] hover:from-[#5B21B6] hover:to-[#DB2777] text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-60"
                    >
                      {submitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <>
                          <Send size={15} />
                          <span>Submit Ticket</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* TAB 2: MY TICKETS (HISTORY) */}
          {activeTab === 'history' && (
            <div className="p-5 sm:p-7 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Your Support Requests ({tickets.length})</h3>
                  <p className="text-xs text-gray-500">Track resolution status and updates from the corporate support desk.</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('ticket');
                    setSubmitSuccess(false);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-purple-50 text-[#7C3AED] hover:bg-purple-100 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <PlusCircle size={14} />
                  <span>Raise New Ticket</span>
                </button>
              </div>

              {loadingTickets ? (
                <div className="py-12 text-center space-y-2">
                  <div className="w-6 h-6 border-2 border-[#7C3AED] border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs text-gray-500">Loading support tickets...</p>
                </div>
              ) : tickets.length === 0 ? (
                <div className="py-12 text-center bg-gray-50/70 rounded-2xl border border-dashed border-gray-200 p-6 space-y-3">
                  <LifeBuoy size={36} className="text-gray-400 mx-auto" />
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-gray-700">No Support Tickets Yet</h4>
                    <p className="text-xs text-gray-500 max-w-md mx-auto">
                      Whenever you have a question or need assistance, raise a ticket here and our team will be delighted to help!
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('ticket')}
                    className="px-4 py-2 rounded-xl bg-[#7C3AED] text-white text-xs font-bold hover:bg-[#6D28D9] transition-all cursor-pointer"
                  >
                    Create Your First Ticket
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {tickets.map((t) => {
                    const isOpen = t.status === 'open';
                    const isInProgress = t.status === 'in_progress';
                    const isResolved = t.status === 'resolved' || t.status === 'closed';

                    const statusBadge = isOpen ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 border border-amber-200">
                        OPEN
                      </span>
                    ) : isInProgress ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-800 border border-blue-200">
                        IN PROGRESS
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        RESOLVED
                      </span>
                    );

                    return (
                      <div
                        key={t.ticket_id}
                        className="bg-white rounded-2xl border border-gray-200/90 p-4 sm:p-5 shadow-2xs hover:shadow-xs transition-all space-y-2"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold text-[#6D28D9] bg-purple-50 px-2 py-0.5 rounded-md">
                              {t.ticket_id}
                            </span>
                            <span className="text-xs font-semibold text-gray-500">· {t.category_name}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-[11px] text-gray-400">
                              {new Date(t.created_at).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </span>
                            {statusBadge}
                          </div>
                        </div>

                        <h4 className="text-sm font-bold text-gray-900">{t.subject}</h4>
                        <p className="text-xs text-gray-600 leading-relaxed">{t.description}</p>

                        {t.attachment_name && (
                          <div className="pt-1 flex items-center gap-1.5 text-[11px] text-gray-500">
                            <FileText size={13} className="text-gray-400" />
                            <span>Attachment: {t.attachment_name}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: FAQS ACCORDION */}
          {activeTab === 'faq' && (
            <div className="p-5 sm:p-7 space-y-3">
              <div className="pb-2">
                <h3 className="text-sm font-bold text-gray-900">Common Questions & Self-Help</h3>
                <p className="text-xs text-gray-500">Get quick answers to standard corporate employee queries.</p>
              </div>

              <div className="space-y-2.5">
                {FAQS.map((faq, idx) => {
                  const isExpanded = expandedFaq === idx;
                  return (
                    <div
                      key={idx}
                      className="border border-gray-200 rounded-2xl overflow-hidden transition-all bg-white"
                    >
                      <button
                        type="button"
                        onClick={() => setExpandedFaq(isExpanded ? -1 : idx)}
                        className="w-full px-4 sm:px-5 py-3.5 text-left flex items-center justify-between gap-3 text-xs sm:text-sm font-bold text-gray-800 hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        <span>{faq.q}</span>
                        {isExpanded ? (
                          <ChevronUp size={16} className="text-purple-600 shrink-0" />
                        ) : (
                          <ChevronDown size={16} className="text-gray-400 shrink-0" />
                        )}
                      </button>
                      {isExpanded && (
                        <div className="px-4 sm:px-5 pb-4 pt-1 text-xs text-gray-600 leading-relaxed border-t border-gray-100 bg-purple-50/20">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="pt-4 text-center">
                <p className="text-xs text-gray-500 mb-2">Still need help with your specific account?</p>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('ticket');
                    setSubmitSuccess(false);
                  }}
                  className="px-4 py-2 rounded-xl bg-[#7C3AED] text-white text-xs font-bold hover:bg-[#6D28D9] transition-all cursor-pointer"
                >
                  Raise a Support Ticket
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── 5. URGENT ESCALATIONS BOTTOM BANNER ── */}
        <div className="bg-gradient-to-r from-[#1E1B4B] via-[#312E81] to-[#4338CA] rounded-3xl p-6 sm:p-7 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1 max-w-xl">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
              <HeadphonesOutlinedIcon sx={{ fontSize: 18 }} />
              <span>Priority Employee Support</span>
            </div>
            <h4 className="text-base sm:text-lg font-black text-white">
              Need immediate help with a critical benefit or hospital admission?
            </h4>
            <p className="text-xs sm:text-sm text-indigo-100 leading-relaxed font-normal">
              Our 24x7 emergency escalation desk connects you directly with a dedicated corporate relationship manager.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <a
              href="tel:+918660583751"
              className="px-5 py-2.5 rounded-xl bg-white text-[#1E1B4B] text-xs sm:text-sm font-bold hover:bg-indigo-50 transition-colors flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <PhoneCall size={15} className="text-[#6D28D9]" />
              <span>Call +91 8660 583751</span>
            </a>
            <button
              type="button"
              onClick={() => {
                setActiveTab('ticket');
                setFormData((prev) => ({
                  ...prev,
                  category_id: 3,
                  category_name: 'Corporate Benefits & Claims',
                  subject: 'URGENT: Hospitalization / GMC Claim Assistance',
                }));
              }}
              className="px-4 py-2.5 rounded-xl bg-indigo-950/60 border border-white/20 text-white text-xs font-bold hover:bg-indigo-900 transition-colors cursor-pointer"
            >
              Priority Ticket
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerSupportPage;
