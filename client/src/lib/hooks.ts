import { useCallback, useEffect, useState } from 'react';
import { api, ApiError } from './api';

interface State<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}

/**
 * Dohvaća podatke s API-ja. Kada je `path` null, dohvaćanje se preskače
 * (korisno dok se čeka parametar rute).
 */
export function useApi<T>(path: string | null, options: { auth?: boolean } = {}) {
  const { auth = false } = options;
  const [state, setState] = useState<State<T>>({ data: null, error: null, loading: path !== null });

  const load = useCallback(async () => {
    if (!path) return;
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const data = await api<T>(path, { auth });
      setState({ data, error: null, loading: false });
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Došlo je do greške.';
      setState({ data: null, error: message, loading: false });
    }
  }, [path, auth]);

  useEffect(() => {
    void load();
  }, [load]);

  return { ...state, reload: load };
}
