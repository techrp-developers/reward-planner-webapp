import type { ServiceEnquiryField as EnquiryField } from './serviceDetailTypes';
import React, { useId } from 'react';


export function ServiceEnquiryForm({ handleFormSubmit, formError, enquiryFields, formValues, handleFieldChange, submitting }: { handleFormSubmit: (event: React.FormEvent) => void | Promise<void>; formError: string; enquiryFields: EnquiryField[]; formValues: Record<string, string>; handleFieldChange: (field: string, value: string) => void; submitting: boolean }) { const formId = useId(); return <form onSubmit={handleFormSubmit} className="space-y-3.5 text-xs">
                  {formError && (
                    <div role="alert" className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                      {formError}
                    </div>
                  )}

                  {enquiryFields.map((field, idx) => (
                    <div key={idx} className="space-y-1">
                      <label htmlFor={`${formId}-${field.field_name}`} className="font-bold text-gray-700 block text-xs">
                        {field.label} {field.is_required && <span className="text-rose-500">*</span>}
                      </label>
                      {field.field_type === 'select' ? (
                        <select id={`${formId}-${field.field_name}`}                           value={formValues[field.field_name] || ''}
                          onChange={(e) => handleFieldChange(field.field_name, e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-[#7C3AED] bg-white shadow-2xs"
                        >
                          <option value="">{field.placeholder || `Select ${field.label}`}</option>
                          {field.options?.map((opt, oIdx) => (
                            <option key={oIdx} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      ) : field.field_type === 'textarea' ? (
                        <textarea id={`${formId}-${field.field_name}`}                           rows={3}
                          value={formValues[field.field_name] || ''}
                          onChange={(e) => handleFieldChange(field.field_name, e.target.value)}
                          placeholder={field.placeholder || `Enter ${field.label}`}
                          className="w-full p-3 border border-gray-300 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-[#7C3AED] bg-white shadow-2xs"
                        />
                      ) : (
                        <input id={`${formId}-${field.field_name}`}                           type={field.field_type || 'text'}
                          value={formValues[field.field_name] || ''}
                          onChange={(e) => handleFieldChange(field.field_name, e.target.value)}
                          placeholder={field.placeholder || `Enter ${field.label}`}
                          className="w-full p-3 border border-gray-300 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-[#7C3AED] bg-white shadow-2xs"
                        />
                      )}
                    </div>
                  ))}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3.5 rounded-full font-bold text-xs sm:text-sm text-white bg-[#1E1260] hover:bg-[#150C48] shadow-md transition-all cursor-pointer flex items-center justify-center disabled:opacity-50"
                  >
                    {submitting ? 'Submitting...' : 'Submit'}
                  </button>
                </form>; }
