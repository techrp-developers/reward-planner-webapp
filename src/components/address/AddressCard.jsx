// src/components/address/AddressCard.jsx
import React from 'react';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { formatFullAddress } from '../../constants/addressConstants';

export const AddressCard = ({
  address,
  isSelected = false,
  onSelect,
  onDeliverHere,
  onEdit,
  onDelete,
  showDeliverHereButton = true,
  showRadio = true,
}) => {
  const addrId = address.id || address.address_id;
  const name = address.contact_name || address.name || 'Customer';
  const phone = address.contact_phone || address.phone || '';
  const type = (address.address_type || address.type || 'HOME').toUpperCase();
  const formattedAddress = formatFullAddress(address);

  return (
    <div
      data-testid="address-card"
      onClick={() => onSelect && onSelect(addrId)}
      className={`relative p-4 sm:p-5 rounded-2xl border transition-all duration-200 cursor-pointer ${
        isSelected
          ? 'border-[#A654CD] bg-purple-50/40 shadow-sm ring-1 ring-[#A654CD]/30'
          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-2xs'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3.5 flex-1 min-w-0">
          {showRadio && (
            <div className="pt-0.5 shrink-0">
              <div
                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                  isSelected ? 'border-[#A654CD] bg-[#A654CD]' : 'border-gray-300 bg-white'
                }`}
              >
                {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
              </div>
            </div>
          )}

          <div className="space-y-1.5 flex-1 min-w-0">
            {/* Header: Name, Type Badge, Phone */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-extrabold text-sm text-gray-900 tracking-tight">
                {name}
              </span>
              <span
                className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                  type === 'HOME'
                    ? 'bg-blue-50 text-blue-700 border border-blue-100'
                    : 'bg-amber-50 text-amber-700 border border-amber-100'
                }`}
              >
                {type}
              </span>
              {phone && (
                <span className="font-bold text-xs text-gray-900 ml-1">
                  {phone}
                </span>
              )}
            </div>

            {/* Address text */}
            <p className="text-xs text-gray-600 leading-relaxed break-words">
              {formattedAddress}
            </p>

            {address.alternate_phone && (
              <p className="text-[11px] text-gray-500 font-medium">
                Alt Phone: <span className="font-semibold text-gray-700">{address.alternate_phone}</span>
              </p>
            )}
          </div>
        </div>

        {/* Action Controls: Edit & Delete */}
        <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
          {onEdit && (
            <button
              type="button"
              onClick={() => onEdit(address)}
              className="px-2.5 py-1 rounded-lg text-xs font-bold text-[#8b3ab5] hover:bg-purple-50 transition-colors flex items-center gap-1 cursor-pointer"
              title="Edit Address"
            >
              <EditOutlinedIcon sx={{ fontSize: 15 }} />
              <span className="hidden sm:inline">EDIT</span>
            </button>
          )}

          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(addrId)}
              className="p-1 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              title="Delete Address"
            >
              <DeleteOutlineOutlinedIcon sx={{ fontSize: 17 }} />
            </button>
          )}
        </div>
      </div>

      {/* Flipkart-Style "DELIVER HERE" Button (Visible when selected in checkout) */}
      {isSelected && showDeliverHereButton && (
        <div className="mt-4 pt-3.5 border-t border-purple-100/80 flex items-center justify-between gap-3">
          <div className="text-[11px] text-gray-500 hidden sm:flex items-center gap-1.5">
            <CheckCircleIcon sx={{ fontSize: 14 }} className="text-emerald-600" />
            <span>Selected as shipping destination</span>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDeliverHere && onDeliverHere(address);
            }}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#8b3ab5] to-[#a855f7] text-white text-xs font-black uppercase tracking-wider shadow-md hover:shadow-lg hover:opacity-95 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span>DELIVER HERE</span>
            <ArrowForwardIcon sx={{ fontSize: 15 }} />
          </button>
        </div>
      )}
    </div>
  );
};
