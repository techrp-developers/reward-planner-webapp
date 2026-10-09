import { createContext, useContext, useEffect, useMemo, type ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../api/client';
import { ENDPOINTS } from '../../api/endpoints';
import { useAuth } from '../../context/AuthContext';

const Session = createContext('');
// Catalogs can vary by employer/session. Never share cached responses across logins.
export function ServiceQuerySession({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const client = useQueryClient();
  const scope = useMemo(() => crypto.randomUUID(), [token]);
  useEffect(() => () => {
    void client.cancelQueries({ queryKey: ['services', scope] });
    client.removeQueries({ queryKey: ['services', scope] });
  }, [client, scope]);
  return <Session.Provider value={scope}>{children}</Session.Provider>;
}

type Resource = 'categories' | 'banners' | 'bundles' | 'list' | 'category' | 'detail' | 'bundle';
const durations: Record<Resource, number> = {
  categories: 30 * 60_000, banners: 15 * 60_000, bundles: 2 * 60_000,
  list: 2 * 60_000, category: 2 * 60_000, detail: 60_000, bundle: 60_000,
};
export function useServiceQuery(resource: Resource, id?: string | number) {
  const scope = useContext(Session);
  const paths = ENDPOINTS.services;
  const endpoint = {
    categories: paths.categories, banners: paths.banners, bundles: paths.bundles,
    list: paths.allServices, category: paths.byCategory(id), detail: paths.details(id), bundle: paths.bundleDetail(id),
  }[resource];
  return useQuery<any, Error>({
    queryKey: ['services', scope, resource, id ?? 'all'],
    enabled: Boolean(scope),
    queryFn: async ({ signal }) => {
      const { data } = await api.get(endpoint, { signal });
      if (data?.success === false) throw new Error(data.message || 'Services are temporarily unavailable.');
      const value = resource === 'category' ? data : data?.data ?? data;
      if (['categories', 'banners', 'bundles', 'list'].includes(resource) && !Array.isArray(value)) {
        throw new Error('The service returned an unexpected response. Please try again.');
      }
      if (value == null) throw new Error('This service is temporarily unavailable.');
      return value;
    },
    staleTime: durations[resource], gcTime: 10 * 60_000,
    retry: false, refetchOnWindowFocus: false,
  });
}
