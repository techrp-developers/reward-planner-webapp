import { useEffect, useRef, type ReactNode } from 'react';
import X from '@mui/icons-material/Close';

export default function Dialog({ title, onClose, children, plain = false }: { title: string; onClose: () => void; children: ReactNode; plain?: boolean }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    dialog?.showModal();
    document.body.style.overflow = 'hidden';
    return () => { dialog?.close(); document.body.style.overflow = overflow; previous?.focus(); };
  }, []);
  return (
    <dialog
      ref={ref}
      onCancel={onClose}
      onClick={event => {
        if (event.target === ref.current) {
          const rect = ref.current.getBoundingClientRect();
          if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) onClose();
        }
      }}
      aria-labelledby={plain ? 'mf-calculator-title' : 'mf-dialog-title'}
      className="mf-dialog fixed inset-0 m-auto max-h-[88dvh] w-[calc(100%-2rem)] max-w-4xl overflow-y-auto rounded-3xl border-0 p-0 shadow-2xl backdrop:bg-black/50"
    >
      {plain ? children : <>
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 bg-gradient-to-r from-[#3545A3] to-[#080B26] p-5 text-white sm:p-7">
          <h2 id="mf-dialog-title" className="text-xl font-semibold">{title}</h2>
          <button autoFocus onClick={onClose} aria-label="Close dialog" className="rounded-full bg-white/15 p-2 hover:bg-white/25"><X sx={{ fontSize: 20 }} /></button>
        </div>
        <div className="p-5 sm:p-8">{children}</div>
      </>}
    </dialog>
  );
}
