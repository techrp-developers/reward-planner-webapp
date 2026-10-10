import ChevronRight from '@mui/icons-material/ChevronRight';
import type { MFCategory } from '../../../../api/mutualFundApi';

export default function FAQSection({ categories, onOpen }: { categories: MFCategory[]; onOpen: (category: MFCategory) => void }) {
  return <section className="mf-panel rounded-3xl border p-6 shadow-sm sm:p-9"><h2 className="mb-6 text-xl font-semibold sm:text-2xl">Frequently asked questions</h2><div className="grid gap-4 sm:grid-cols-2">{categories.map(category => <button key={category.id} onClick={() => onOpen(category)} className="mf-topic flex items-center justify-between gap-4 rounded-3xl px-5 py-6 text-left text-base font-medium transition hover:shadow-sm sm:text-lg"><span>{category.title}</span><ChevronRight className="mf-accent shrink-0" sx={{ fontSize: 23 }} /></button>)}</div>{!categories.length && <p className="mf-muted text-sm">Frequently asked questions will appear here when published.</p>}</section>;
}
