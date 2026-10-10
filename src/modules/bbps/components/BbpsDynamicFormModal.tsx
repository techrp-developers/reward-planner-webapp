import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, ShieldCheck, ArrowRight, Smartphone, AlertCircle, Sparkles, HelpCircle, Layers } from 'lucide-react';
import BbpsOperatorLogo from './BbpsOperatorLogo';

export const BbpsDynamicFormModal = ({
  operator,
  operatorDetails,
  loadingDetails,
  locations = [],
  selectedCircle,
  onSelectCircle,
  onOpenPlans,
  selectedPlan,
  onFetchBill,
  fetchingBill,
  onClose,
}) => {
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, any>>({});
  const isPrepaid = Number(operator?.operator_category) === 5;

  // Initialize form fields when operator details load
  useEffect(() => {
    if (operatorDetails?.data && Array.isArray(operatorDetails.data)) {
      const initial = {};
      operatorDetails.data.forEach((field) => {
        if (field.param_name && field.param_name !== 'recharge_plan_id') {
          initial[field.param_name] = '';
        }
      });
      setFormValues(initial);
      setErrors({});
    }
  }, [operatorDetails]);

  // If a recharge plan is selected, update amount in form
  useEffect(() => {
    if (selectedPlan && isPrepaid) {
      setFormValues((prev) => ({
        ...prev,
        amount: selectedPlan.amount || selectedPlan.price || '',
      }));
    }
  }, [selectedPlan, isPrepaid]);

  // Prevent background scrolling while modal is open
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  const handleChange = (fieldName, value, fieldConfig) => {
    // If numeric field, strip non-digits
    let cleanVal = value;
    if (fieldConfig?.param_type?.toLowerCase() === 'numeric') {
      cleanVal = value.replace(/[^0-9]/g, '');
    }
    const isVehicleNumber = /vehicle/i.test(fieldConfig?.param_label || '') ||
      (/fastag/i.test(operator?.name || '') && fieldName === 'utility_acc_no');
    if (isVehicleNumber) cleanVal = cleanVal.toUpperCase();

    setFormValues((prev) => ({
      ...prev,
      [fieldName]: cleanVal,
    }));

    // Clear error on edit
    if (errors[fieldName]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[fieldName];
        return next;
      });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    const fields = operatorDetails?.data || [];

    for (const field of fields) {
      if (field.param_name === 'recharge_plan_id') continue;
      const val = (formValues[field.param_name] || '').trim();

      if (!val) {
        newErrors[field.param_name] = field.error_message || `${field.param_label} is required.`;
        continue;
      }

      if (field.regex) {
        try {
          const reg = new RegExp(field.regex);
          if (!reg.test(val)) {
            newErrors[field.param_name] = field.error_message || `Invalid format for ${field.param_label}.`;
          }
        } catch {
          // ignore invalid regex
        }
      }
    }

    if (isPrepaid) {
      if (!formValues.utility_acc_no && !formValues.mobile) {
        newErrors.utility_acc_no = 'Mobile number is required.';
      }
      if (!selectedCircle) {
        newErrors.circle = 'Please select your telecom circle.';
      }
      if (!selectedPlan && !formValues.amount) {
        newErrors.plan = 'Please select a recharge plan or enter amount.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBrowsePlans = () => {
    const mobile = String(formValues.utility_acc_no || formValues.mobile || '').trim();
    const planErrors: Record<string, string> = {};
    if (!/^[6-9]\d{9}$/.test(mobile)) {
      planErrors[formValues.mobile !== undefined ? 'mobile' : 'utility_acc_no'] = 'Please enter a valid 10-digit mobile number.';
    }
    if (!selectedCircle) planErrors.circle = 'Please select your telecom circle.';
    setErrors(planErrors);
    if (Object.keys(planErrors).length === 0) {
      onOpenPlans({ mobile, circleId: selectedCircle });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    onFetchBill({
      formValues,
      selectedCircle,
      selectedPlan,
    });
  };

  const fields = (operatorDetails?.data || []).filter(
    (f) => f.param_name && f.param_name !== 'recharge_plan_id'
  );

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[85vh] my-auto">
        {/* Modal Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-[#1C0E28] to-[#3B1953] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BbpsOperatorLogo operator={operator} className="h-10 w-10" eager />
            <div>
              <h3 className="text-base font-bold text-white leading-tight">
                {operator.name}
              </h3>
              <p className="text-xs text-purple-200">
                {isPrepaid ? 'Mobile Recharge' : 'Bill Details Verification'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
          {loadingDetails ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-gray-500 font-medium">Fetching biller parameters...</p>
            </div>
          ) : (
            <>
              {/* Trust Tag */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-purple-50 border border-purple-100 text-xs text-purple-900">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={18} className="text-purple-600" />
                  <span className="font-semibold">Official BBPS Certified Fetch</span>
                </div>
                <span className="text-[11px] font-bold text-purple-700 bg-purple-100/80 px-2 py-0.5 rounded-full">
                  Instant
                </span>
              </div>

              {/* Dynamic Operator Input Fields */}
              <div className="space-y-4">
                {fields.length === 0 && !isPrepaid && (
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-gray-700">
                      Consumer / Account Number
                    </label>
                    <input
                      type="text"
                      value={formValues.utility_acc_no || ''}
                      onChange={(e) =>
                        setFormValues((prev) => ({ ...prev, utility_acc_no: e.target.value }))
                      }
                      placeholder="Enter consumer or account number"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 text-sm font-medium outline-none"
                    />
                  </div>
                )}

                {fields.map((field) => {
                  const error = errors[field.param_name];
                  return (
                    <div key={field.param_name} className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label htmlFor={`bbps-field-${field.param_name}`} className="block text-xs font-bold text-gray-700">
                          {field.param_label} <span className="text-rose-500">*</span>
                        </label>
                      </div>

                      <input
                        id={`bbps-field-${field.param_name}`}
                        aria-invalid={Boolean(error)}
                        aria-describedby={error ? `bbps-error-${field.param_name}` : undefined}
                        type={field.param_type?.toLowerCase() === 'numeric' ? 'tel' : 'text'}
                        value={formValues[field.param_name] || ''}
                        onChange={(e) => handleChange(field.param_name, e.target.value, field)}
                        placeholder={`Enter ${field.param_label.toLowerCase()}`}
                        className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium outline-none transition-all ${
                          error
                            ? 'border-rose-400 bg-rose-50/30 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                            : 'border-gray-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20'
                        }`}
                      />

                      {error && (
                        <p id={`bbps-error-${field.param_name}`} role="alert" className="text-[11px] font-medium text-rose-500 flex items-center gap-1">
                          <AlertCircle size={12} />
                          <span>{error}</span>
                        </p>
                      )}
                    </div>
                  );
                })}

                {/* Additional Telecom Options for Prepaid Recharge */}
                {isPrepaid && (
                  <div className="space-y-4 pt-2">
                    {/* Circle Selector */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-gray-700">
                        Telecom Circle / State <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={selectedCircle || ''}
                        onChange={(e) => onSelectCircle(e.target.value)}
                        className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium outline-none bg-white ${
                          errors.circle
                            ? 'border-rose-400 bg-rose-50/30'
                            : 'border-gray-300 focus:border-purple-600'
                        }`}
                      >
                        <option value="">Select your telecom circle</option>
                        {locations.map((loc) => (
                          <option key={loc.operator_location_id} value={loc.operator_location_id}>
                            {loc.operator_location_name}
                          </option>
                        ))}
                      </select>
                      {errors.circle && (
                        <p className="text-[11px] text-rose-500 font-medium">{errors.circle}</p>
                      )}
                    </div>

                    {/* Plan Selector Trigger */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-bold text-gray-700">
                          Recharge Plan
                        </label>
                        <button
                          type="button"
                          onClick={handleBrowsePlans}
                          className="text-xs font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1 cursor-pointer"
                        >
                          <Layers size={14} />
                          <span>Browse All Plans</span>
                        </button>
                      </div>

                      {selectedPlan ? (
                        <div className="p-3.5 rounded-2xl bg-purple-50/80 border border-purple-200 flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-lg font-black text-purple-950">
                                ₹{selectedPlan.amount}
                              </span>
                              <span className="text-xs px-2 py-0.5 rounded-md bg-purple-200/80 text-purple-900 font-bold">
                                {selectedPlan.validity}
                              </span>
                            </div>
                            <p className="text-xs text-gray-600 mt-1 line-clamp-1">
                              {selectedPlan.description}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={handleBrowsePlans}
                            className="text-xs font-bold text-purple-700 hover:underline cursor-pointer"
                          >
                            Change
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={handleBrowsePlans}
                          className="w-full py-3 px-4 rounded-xl border border-dashed border-purple-300 hover:border-purple-500 bg-purple-50/40 hover:bg-purple-50 text-purple-800 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                        >
                          <Sparkles size={16} className="text-purple-600" />
                          <span>Browse & Select Recharge Plan</span>
                        </button>
                      )}
                      {errors.plan && (
                        <p className="text-[11px] text-rose-500 font-medium">{errors.plan}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Action Buttons */}
          <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={fetchingBill}
              className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loadingDetails || fetchingBill}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all active:scale-98 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
            >
              {fetchingBill ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Connecting to Biller...</span>
                </>
              ) : (
                <>
                  <span>{isPrepaid ? 'Proceed to Recharge' : 'Fetch Bill'}</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default BbpsDynamicFormModal;
