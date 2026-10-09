import type { UseQueryResult } from '@tanstack/react-query';

export default function ServiceSectionState({ query, label, empty = false, skeleton = 'cards' }: {
  query: Pick<UseQueryResult, 'isPending' | 'isError' | 'refetch'>; label: string; empty?: boolean; skeleton?: 'banner' | 'categories' | 'cards';
}) {
  if (query.isPending && skeleton === 'banner') return <div role="status" aria-label={`Loading ${label}`} className="w-full animate-pulse rounded-2xl bg-gray-100 sm:rounded-3xl" style={{ aspectRatio: '1024 / 395' }} />;
  if (query.isPending && skeleton === 'categories') return <div role="status" aria-label={`Loading ${label}`} className="grid grid-cols-1 gap-4 sm:grid-cols-12">
    {[1, 2, 3, 4, 5].map(id => <div key={id} className={`${id === 4 ? 'sm:col-span-8' : 'sm:col-span-4'} h-32 animate-pulse rounded-2xl bg-gray-100`} />)}
  </div>;
  if (query.isPending) return <div role="status" aria-label={`Loading ${label}`} className="grid grid-cols-1 gap-4 sm:grid-cols-3">
    {[1, 2, 3].map(id => <div key={id} className="h-32 animate-pulse rounded-2xl bg-gray-100" />)}
  </div>;
  if (query.isError) return <div role="alert" className="rounded-2xl border border-gray-200 bg-white p-6 text-center text-sm">
    <p>Could not load {label}. Please try again.</p>
    <button type="button" onClick={() => void query.refetch()} className="mt-3 rounded-lg border border-purple-200 px-4 py-2 font-bold text-purple-700">Retry {label}</button>
  </div>;
  if (empty) return <p role="status" className="rounded-2xl border border-gray-200 bg-white p-6 text-center text-sm text-gray-500">No {label} are currently available.</p>;
  return null;
}
