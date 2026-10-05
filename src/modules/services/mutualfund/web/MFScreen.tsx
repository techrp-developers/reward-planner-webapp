import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import { getMutualFundCategories, getSectionContent, type MFCategory, type MFChildCategory, type MFArticleSummary } from '../../../../api/mutualFundApi';
import CommonQuestions from './CommonQuestions';
import CalculatorCard, { CALCULATORS } from './CalculatorCard';
import CalculatorScreen from './CalculatorScreen';
import type { CalculatorKind } from './calculations';
import ArticleDetails, { errorText, type ContentSelection } from './ArticleDetails';
import ArticleRow from './ArticleRow';
import ArticleCard, { plainText } from './ArticleCard';
import Dialog from './Dialog';
import './mutualfund.css';

const sorted = <T extends { sort_order?: number }>(items: T[] = []) => [...items].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
function flatten(section: MFChildCategory): MFArticleSummary[] {
  return [...(section.articles || []), ...sorted(section.children).flatMap(flatten)];
}
function unique(articles: MFArticleSummary[]) { return [...new Map(articles.map(article => [article.id, article])).values()]; }
const descriptions: Record<number, string> = {
  5: 'Thinking of investing in mutual funds but not sure where to start? Explore articles that answer your investment questions.',
  6: 'Want to understand more about mutual funds? Explore curated articles for information and guidance.',
};

export default function MFScreen() {
  const [categories, setCategories] = useState<MFCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const [query, setQuery] = useState('');
  const [searchArticles, setSearchArticles] = useState<MFArticleSummary[] | null>(null);
  const [searchError, setSearchError] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [calculator, setCalculator] = useState<CalculatorKind | null>(null);
  const [selection, setSelection] = useState<ContentSelection | null>(null);
  const [group, setGroup] = useState<MFChildCategory | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    getMutualFundCategories(Number(import.meta.env.VITE_MF_CATEGORY_ID || 4), controller.signal).then(data => {
      if (!controller.signal.aborted) { setCategories(Array.isArray(data) ? sorted(data) : []); setLoading(false); }
    }).catch(reason => { if (!controller.signal.aborted) { setError(errorText(reason)); setLoading(false); } });
    return () => controller.abort();
  }, [attempt]);
  const hasQuery = Boolean(query.trim());
  useEffect(() => {
    if (!hasQuery || !categories.length || searchArticles) return;
    const controller = new AbortController();
    // The tree omits previews for FAQ sections. Include their articles in search.
    const timer = window.setTimeout(() => {
      Promise.all(categories.filter(category => !category.has_children).map(category => getSectionContent(category.id, controller.signal)))
        .then(content => { if (!controller.signal.aborted) setSearchArticles(content.flatMap(section => section.articles)); })
        .catch(() => { if (!controller.signal.aborted) setSearchError('Some FAQ articles could not be searched. You can still open their topics above.'); });
    }, 250);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [hasQuery, categories, searchArticles]);
  const openSection = (section: MFChildCategory) => {
    if (section.children?.length) { setSelection(null); setGroup(section); }
    else { setGroup(null); setSelection({ kind: 'section', id: section.id, title: section.title }); }
  };
  const openArticle = (article: MFArticleSummary) => {
    if (!article.section_id) return;
    setGroup(null);
    setSelection({ kind: 'article', id: article.id, sectionId: article.section_id, title: article.title });
  };
  const faq = categories.filter(category => !category.has_children);
  const matchingFaq = faq.filter(category => !query.trim() || category.title.toLowerCase().includes(query.trim().toLowerCase()));
  const rows = categories.filter(category => category.has_children);
  const articles = unique([...categories.flatMap(flatten), ...(searchArticles || [])]);
  const results = articles.filter(article => `${article.title} ${plainText(article.short_description)}`.toLowerCase().includes(query.trim().toLowerCase()));
  return <div className="mf-page mx-auto max-w-[1440px] px-4 py-6 sm:px-8 lg:px-12"><nav aria-label="Breadcrumb" className="mf-muted mb-6 flex items-center gap-2 text-sm"><Link to="/services" className="mf-accent flex items-center gap-1"><ArrowLeft size={15} /> Services</Link><span>/</span><span>Mutual Funds</span></nav>
    <CommonQuestions categories={matchingFaq} query={query} onQuery={setQuery} results={results} onSection={openSection} onArticle={openArticle} status={loading ? 'loading' : error ? 'error' : undefined} />
    {hasQuery && !searchArticles && !searchError && !loading && <p role="status" className="mf-muted -mt-8 mb-8 text-sm">Searching FAQ articles…</p>}
    {hasQuery && searchError && <p role="status" className="mf-muted -mt-8 mb-8 text-sm">{searchError}</p>}
    <section id="mf-calculators" className="mb-14 scroll-mt-8"><h2 className="text-2xl font-semibold sm:text-3xl">Plan your investment smartly</h2><p className="mf-muted mb-8 mt-4">Plan your investment journey with simple calculators.</p><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{CALCULATORS.slice(0, 5).map((item, index) => <CalculatorCard key={item.id} item={item} featured={index === 0} onClick={() => setCalculator(item.id)} />)}</div>{expanded && <div id="mf-more-calculators" className="mt-5 grid gap-5 sm:grid-cols-2">{CALCULATORS.slice(5).map(item => <CalculatorCard key={item.id} item={item} onClick={() => setCalculator(item.id)} />)}</div>}<button aria-expanded={expanded} aria-controls="mf-more-calculators" onClick={() => setExpanded(value => !value)} className="mf-primary-button mt-6">{expanded ? 'Show fewer calculators' : 'View all 9 calculators'}</button></section>
    <div className="space-y-8">{loading ? <div role="status" className="grid animate-pulse gap-5 sm:grid-cols-3">{[1, 2, 3].map(id => <div key={id} className="mf-topic h-72 rounded-3xl" />)}<span className="sr-only">Loading mutual fund articles</span></div> : error ? <div role="alert" className="mf-panel rounded-3xl border p-8 text-center"><p className="mf-muted mb-4">{error}</p><button className="mf-primary-button" onClick={() => { setLoading(true); setError(''); setAttempt(value => value + 1); }}>Try again</button></div> : !categories.length ? <div className="mf-panel mf-muted rounded-3xl p-10 text-center">Mutual fund learning content will appear here when published.</div> : rows.map(category => <ArticleRow key={category.id} section={{ ...category, title: category.id === 5 ? 'Mutual Fund Investment for New Investors' : category.id === 6 ? 'Mutual Fund Investment for Savvy Investors' : category.title }} articles={unique(flatten(category))} description={descriptions[category.id] || (/watch|video/i.test(category.title) ? 'Learn about mutual funds with informative educational content.' : 'Explore articles and practical information to help you understand mutual funds.')} onSection={openSection} onArticle={openArticle} />)}</div>
    {calculator && <Dialog title={CALCULATORS.find(item => item.id === calculator)!.title} onClose={() => setCalculator(null)}><CalculatorScreen key={calculator} kind={calculator} /></Dialog>}
    {selection && <ArticleDetails key={`${selection.kind}-${selection.id}`} selection={selection} onClose={() => setSelection(null)} onArticle={openArticle} />}
    {group && <Dialog title={group.title} onClose={() => setGroup(null)}><div className="space-y-4">{sorted(group.children).map(child => <button key={child.id} onClick={() => openSection(child)} className="mf-topic flex w-full items-center justify-between gap-4 rounded-2xl p-5 text-left"><span>{child.title}</span><ChevronRight className="mf-accent" size={20} /></button>)}</div>{group.articles?.length ? <div className="mt-6 grid gap-5 sm:grid-cols-2">{group.articles.map(article => <ArticleCard key={article.id} article={article} onOpen={openArticle} />)}</div> : null}</Dialog>}
  </div>;
}
