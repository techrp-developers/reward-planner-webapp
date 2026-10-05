// src/modules/bbps/BBPSPage.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  fetchBbpsCategories,
  fetchBbpsLocations,
  fetchBbpsOperators,
  fetchBbpsOperatorDetails,
  fetchBbpsRechargePlans,
  fetchBbpsBill,
  createBbpsOrder,
  verifyBbpsPayment,
  checkBbpsTransactionStatus,
  cancelUnpaidBbpsOrder,
} from '../../api/bbpsApi';
import { loadRazorpay } from '../../utils/loadRazorpay';
import { useAuth } from '../../context/AuthContext';

import BbpsHeroBanner from './components/BbpsHeroBanner';
import BbpsQuickPay from './components/BbpsQuickPay';
import BbpsAllBillPayments from './components/BbpsAllBillPayments';
import BbpsPaymentBenefits from './components/BbpsPaymentBenefits';
import BbpsOthersSection from './components/BbpsOthersSection';
import BbpsBillerDirectory from './components/BbpsBillerDirectory';
import BbpsDynamicFormModal from './components/BbpsDynamicFormModal';
import BbpsRechargePlansModal from './components/BbpsRechargePlansModal';
import BbpsPaymentConfirmationModal from './components/BbpsPaymentConfirmationModal';
import BbpsReceiptModal from './components/BbpsReceiptModal';
import BbpsOrderHistory from './components/BbpsOrderHistory';

export const BBPSPage = () => {
  const { user, isAuthenticated, openAuth } = useAuth();
  const navigate = useNavigate();

  // Navigation tab: 'pay' vs 'history'
  const [activeTab, setActiveTab] = useState('pay');

  // Sub-view in 'pay' tab: 'home' (exact mobile layout) vs 'biller-select' (operator list)
  const [viewMode, setViewMode] = useState('home');

  // Directory Data
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(8); // Default to Electricity
  const [operators, setOperators] = useState([]);
  const [loadingOperators, setLoadingOperators] = useState(false);
  const [locations, setLocations] = useState([]);
  const [selectedCircle, setSelectedCircle] = useState('');

  // Selected Operator & Field Schema
  const [selectedOperator, setSelectedOperator] = useState(null);
  const [operatorDetails, setOperatorDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Recharge Plans
  const [showPlansModal, setShowPlansModal] = useState(false);
  const [plansData, setPlansData] = useState(null);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  // Bill Fetch & Review
  const [fetchingBill, setFetchingBill] = useState(false);
  const [fetchedBillData, setFetchedBillData] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Payment Processing & Live Receipt
  const [processingPayment, setProcessingPayment] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [transactionStatusData, setTransactionStatusData] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  const activePollingRef = useRef(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4500);
  };

  // 1. Fetch Categories & Locations on Mount
  useEffect(() => {
    fetchBbpsCategories()
      .then((cats) => {
        if (Array.isArray(cats) && cats.length > 0) {
          setCategories(cats);
        }
      })
      .catch((err) => console.error('Error fetching categories:', err));

    fetchBbpsLocations()
      .then((locs) => {
        if (Array.isArray(locs) && locs.length > 0) {
          setLocations(locs);
        }
      })
      .catch((err) => console.error('Error fetching locations:', err));
  }, []);

  // 2. Fetch Operators when category changes
  useEffect(() => {
    setLoadingOperators(true);
    fetchBbpsOperators(selectedCategory)
      .then((ops) => {
        setOperators(Array.isArray(ops) ? ops : []);
      })
      .catch((err) => {
        console.error('Error loading operators:', err);
        setOperators([]);
      })
      .finally(() => setLoadingOperators(false));
  }, [selectedCategory]);

  // 3. Category Selection -> opens Biller Selection view (matching mobile flow)
  const handleSelectCategory = (categoryId) => {
    setSelectedCategory(categoryId);
    setViewMode('biller-select');
  };

  // 4. Handle Operator Click
  const handleSelectOperator = async (op) => {
    setSelectedOperator(op);
    setSelectedPlan(null);
    setPlansData(null);
    setFetchedBillData(null);
    setLoadingDetails(true);

    try {
      const details = await fetchBbpsOperatorDetails(op.operator_id);
      setOperatorDetails(details);
    } catch {
      setOperatorDetails({
        operator_name: op.name,
        operator_id: op.operator_id,
        fetchBill: 1,
        data: [
          {
            param_name: 'utility_acc_no',
            param_label: 'Consumer Account Number',
            regex: '^[0-9A-Za-z]{6,20}$',
            param_type: 'Alphanumeric',
            error_message: 'Please enter a valid account number.',
          },
        ],
      });
    } finally {
      setLoadingDetails(false);
    }
  };

  // 5. Open Recharge Plans Modal
  const handleOpenPlans = async () => {
    setShowPlansModal(true);
    setLoadingPlans(true);

    try {
      const res = await fetchBbpsRechargePlans({
        mobile: user?.phone || '9999999999',
        operatorId: selectedOperator?.operator_id,
        circleId: selectedCircle || '',
      });
      setPlansData(res.data);
    } catch (error) {
      console.error('Failed to load plans:', error);
      showToast('Could not load recharge plans. Please enter amount manually.');
    } finally {
      setLoadingPlans(false);
    }
  };

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
    setShowPlansModal(false);
  };

  // 6. Handle Bill Fetch / Recharge Proceed
  const handleFetchBill = async ({ formValues, selectedCircle: circle, selectedPlan: plan }) => {
    const isPrepaid = Number(selectedOperator?.operator_category) === 5;

    // A. Prepaid Mobile Flow (Does not need bill fetch)
    if (isPrepaid) {
      const amount = plan?.amount || plan?.price || formValues.amount || 0;
      const mobileNumber = formValues.utility_acc_no || formValues.mobile || user?.phone || '';

      setFetchedBillData({
        customer: {
          consumerNumber: mobileNumber,
          customerName: user?.name || 'Customer',
          operatorId: String(selectedOperator.operator_id),
        },
        bill: {
          amount: String(amount),
          dueDate: '',
          billNumber: '',
        },
        planId: plan?.planId || plan?.id || 'standard',
        circleId: circle || '',
        formValues,
      });

      setShowConfirmModal(true);
      return;
    }

    // B. Postpaid / Utility Bill Flow (Requires fetch bill)
    setFetchingBill(true);
    try {
      const payload = {
        operator_id: String(selectedOperator.operator_id),
        sender_name: user?.name || 'Customer',
        confirmation_mobile_no: user?.phone || formValues.confirmation_mobile_no || '9999999999',
        ...formValues,
      };

      const res = await fetchBbpsBill(payload);

      if (res && (res.success || res.data?.bill)) {
        setFetchedBillData({
          ...res,
          formValues,
        });
        setShowConfirmModal(true);
      } else {
        showToast(res?.message || 'Unable to fetch bill. Please verify your consumer details.');
      }
    } catch (error) {
      console.error('Fetch bill error:', error);
      showToast(error?.message || 'Bill fetch failed. Please check the consumer number and try again.');
    } finally {
      setFetchingBill(false);
    }
  };

  // 7. Polling Live Transaction Status
  const startStatusPolling = useCallback((transactionId) => {
    if (activePollingRef.current) clearInterval(activePollingRef.current);

    let attempts = 0;
    activePollingRef.current = setInterval(async () => {
      attempts += 1;
      try {
        const res = await checkBbpsTransactionStatus(transactionId);
        const data = res?.data || res;
        const status = String(data?.final_status || data?.bbps_status || '').toUpperCase();

        setTransactionStatusData({
          ...data,
          transaction_id: transactionId,
        });

        if (status === 'SUCCESS' || status === 'PAID' || status === 'FAILED' || status === 'REFUNDED' || attempts >= 15) {
          clearInterval(activePollingRef.current);
          activePollingRef.current = null;
        }
      } catch (err) {
        if (attempts >= 10) {
          clearInterval(activePollingRef.current);
          activePollingRef.current = null;
        }
      }
    }, 3000);
  }, []);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (activePollingRef.current) clearInterval(activePollingRef.current);
    };
  }, []);

  // 8. Proceed to Razorpay Payment Execution
  const handleProceedToPay = async () => {
    if (!isAuthenticated) {
      openAuth?.();
      return;
    }

    setProcessingPayment(true);
    let currentTxnId = null;

    try {
      const isPrepaid = Number(selectedOperator?.operator_category) === 5;
      let createPayload = {};

      if (isPrepaid) {
        createPayload = {
          operator_id: String(selectedOperator.operator_id),
          utility_acc_no: String(fetchedBillData.customer?.consumerNumber || ''),
          circle_id: String(fetchedBillData.circleId || ''),
          plan_id: String(fetchedBillData.planId || ''),
          sender_name: user?.name || 'Customer',
        };
      } else {
        const billFetchId = fetchedBillData?.billFetchId || fetchedBillData?.data?.billFetchId;
        if (!billFetchId) {
          throw new Error('Bill verification reference is missing. Please fetch bill again.');
        }
        createPayload = {
          operator_id: String(selectedOperator.operator_id),
          bill_fetch_id: billFetchId,
        };
      }

      // Step A: Create order in backend
      const orderRes = await createBbpsOrder(createPayload);
      const orderData = orderRes?.data || orderRes;

      if (!orderData?.orderId || !orderData?.key) {
        throw new Error(orderRes?.message || 'Failed to create payment order.');
      }

      currentTxnId = orderData.transaction_id;

      // Step B: Load Razorpay
      const RazorpaySDK = await loadRazorpay();
      if (!RazorpaySDK) {
        throw new Error('Could not load payment gateway. Please disable ad-blockers and try again.');
      }

      // Step C: Open Razorpay modal
      const options = {
        key: orderData.key,
        order_id: orderData.orderId,
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name: 'Reward Planners',
        description: `${selectedOperator.name} Payment`,
        prefill: {
          name: user?.name || fetchedBillData.customer?.customerName || '',
          contact: user?.phone || fetchedBillData.customer?.consumerNumber || '',
          email: user?.email || '',
        },
        theme: {
          color: '#704096',
        },
        handler: async (response) => {
          try {
            // Verify payment with backend
            const verifyPayload = {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            };

            const verifyRes = await verifyBbpsPayment(verifyPayload);
            const verifiedTxnId = verifyRes?.transaction_id || currentTxnId;

            setShowConfirmModal(false);
            setSelectedOperator(null);
            setShowReceiptModal(true);

            setTransactionStatusData({
              success: true,
              transaction_id: verifiedTxnId,
              bbps_status: 'PAID',
              final_status: 'SUCCESS',
              amount: orderData.amount / 100,
              razorpay: { payment_id: response.razorpay_payment_id },
            });

            // Start live status verification check
            startStatusPolling(verifiedTxnId);
          } catch (verifyErr) {
            console.error('Payment verification failed:', verifyErr);
            setShowConfirmModal(false);
            setShowReceiptModal(true);
            setTransactionStatusData({
              success: false,
              transaction_id: currentTxnId,
              bbps_status: 'PENDING',
              final_status: 'PENDING',
              amount: orderData.amount / 100,
            });
            startStatusPolling(currentTxnId);
          }
        },
        modal: {
          ondismiss: () => {
            setProcessingPayment(false);
            if (currentTxnId) {
              cancelUnpaidBbpsOrder(currentTxnId);
            }
          },
        },
      };

      const rzpInstance = new RazorpaySDK(options);
      rzpInstance.open();
    } catch (error) {
      console.error('Payment flow error:', error);
      showToast(error?.message || 'Unable to proceed with payment.');
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'pay') {
      setViewMode('home');
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF9FD] text-[#17131D] pb-20 pt-4">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 p-4 rounded-2xl bg-gray-900 text-white shadow-2xl flex items-center gap-3 text-xs sm:text-sm font-semibold border border-purple-500/30 animate-in slide-in-from-top-4 duration-200">
          <span>{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage('')}
            className="text-gray-400 hover:text-white cursor-pointer ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Container - Full width matching TopHeader max-w-[1680px] */}
      <div className="w-full max-w-[1680px] mx-auto px-4 sm:px-8 lg:px-12 space-y-8">
        {/* 1. Hero Gradient Banner ("Everything due, all in one place." + wallet) */}
        <BbpsHeroBanner
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />

        {/* 2. Main Body */}
        {activeTab === 'pay' ? (
          viewMode === 'home' ? (
            /* EXACT 1:1 MOBILE APP HOME SCREEN VIEW */
            <div className="space-y-7 animate-in fade-in duration-200">
              {/* Section 1: | Quick pay */}
              <BbpsQuickPay
                selectedCategory={selectedCategory}
                onSelectCategory={handleSelectCategory}
              />

              {/* Section 2: | All bill payments card */}
              <BbpsAllBillPayments
                categories={categories}
                selectedCategory={selectedCategory}
                onSelectCategory={handleSelectCategory}
              />

              {/* Section 3: | Payment benefits card (Lavender container) */}
              <BbpsPaymentBenefits />

              {/* Section 4: | Others (History & Support) */}
              <BbpsOthersSection
                onOpenHistory={() => setActiveTab('history')}
                onOpenSupport={() => navigate('/support')}
              />
            </div>
          ) : (
            /* BILLER SELECTION SCREEN (matching mobile BillerSelectScreen) */
            <BbpsBillerDirectory
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              onBackToHome={() => setViewMode('home')}
              operators={operators}
              loadingOperators={loadingOperators}
              locations={locations}
              selectedCircle={selectedCircle}
              onSelectCircle={setSelectedCircle}
              onSelectOperator={handleSelectOperator}
            />
          )
        ) : (
          /* TRANSACTION HISTORY VIEW */
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => handleTabChange('pay')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-[#E7E1F0] text-xs font-bold text-[#704096] hover:bg-purple-50 cursor-pointer shadow-2xs"
              >
                ← Back to Pay Bills
              </button>
            </div>

            <BbpsOrderHistory
              onSelectOrder={(order) => {
                setTransactionStatusData({
                  ...order,
                  transaction_id: order.id,
                });
                setShowReceiptModal(true);
              }}
            />
          </div>
        )}
      </div>

      {/* 3. Dynamic Biller Input Form Modal */}
      {selectedOperator && !showConfirmModal && !showReceiptModal && (
        <BbpsDynamicFormModal
          operator={selectedOperator}
          operatorDetails={operatorDetails}
          loadingDetails={loadingDetails}
          locations={locations}
          selectedCircle={selectedCircle}
          onSelectCircle={setSelectedCircle}
          onOpenPlans={handleOpenPlans}
          selectedPlan={selectedPlan}
          onFetchBill={handleFetchBill}
          fetchingBill={fetchingBill}
          onClose={() => {
            setSelectedOperator(null);
            setSelectedPlan(null);
          }}
        />
      )}

      {/* 4. Prepaid Recharge Plans Browser Modal */}
      {showPlansModal && (
        <BbpsRechargePlansModal
          plansData={plansData}
          loadingPlans={loadingPlans}
          onSelectPlan={handleSelectPlan}
          onClose={() => setShowPlansModal(false)}
          mobile={user?.phone || ''}
          operatorName={selectedOperator?.name || ''}
        />
      )}

      {/* 5. Bill Review & Razorpay Confirmation Modal */}
      {showConfirmModal && selectedOperator && (
        <BbpsPaymentConfirmationModal
          operator={selectedOperator}
          billData={fetchedBillData}
          onProceedToPay={handleProceedToPay}
          processing={processingPayment}
          onClose={() => setShowConfirmModal(false)}
        />
      )}

      {/* 6. Success / Transaction Receipt Modal */}
      {showReceiptModal && (
        <BbpsReceiptModal
          statusData={transactionStatusData}
          operator={selectedOperator}
          billData={fetchedBillData}
          onClose={() => {
            setShowReceiptModal(false);
            setTransactionStatusData(null);
            setFetchedBillData(null);
            setSelectedOperator(null);
          }}
        />
      )}
    </div>
  );
};

export default BBPSPage;
