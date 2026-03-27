import { useState, useEffect } from 'react';

/**
 * Custom hook for data fetching with loading and error states.
 * @param {Function} fetchFn - async function that returns data
 * @param {Array} deps - dependency array for re-fetching
 */
export function useApi(fetchFn, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchFn()
      .then((result) => {
        if (!cancelled) {
          setData(result);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message);
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, deps);

  return { data, loading, error, setData };
}
