import React from 'react';

interface NotebookPenIconProps {
  className?: string;
  size?: number;
}

export const NotebookPenIcon: React.FC<NotebookPenIconProps> = ({
  className = 'w-5 h-5 text-[#1C0E28]',
  size = 20,
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {/* Notebook Cover / Page */}
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H18a2 2 0 0 1 2 2v8" />
      {/* Bottom curved page edge */}
      <path d="M6.5 22H18a2 2 0 0 0 2-2v-1" />
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      {/* Spiral binding rings */}
      <path d="M2 6h4" />
      <path d="M2 10h4" />
      <path d="M2 14h4" />
      <path d="M2 18h4" />
      {/* Ruled lines inside notebook */}
      <line x1="9" y1="7" x2="15" y2="7" />
      <line x1="9" y1="11" x2="13" y2="11" />
      {/* Sleek Pen writing on bottom right */}
      <path d="m15.5 18.5 4.5-4.5a1.4 1.4 0 0 1 2 2l-4.5 4.5L14 21l1.5-2.5z" fill="currentColor" fillOpacity="0.15" />
      <path d="m18 16 2 2" />
    </svg>
  );
};

export default NotebookPenIcon;
