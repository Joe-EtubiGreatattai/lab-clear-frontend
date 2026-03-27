import { useState, useEffect, useCallback } from 'react';
import { getMyResultsApi, getResultApi } from '../api/result.api';

export const useMyResults = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetch = useCallback(() => {
    setLoading(true);
    getMyResultsApi()
      .then(({ data }) => setResults(data.results))
      .catch(() => setError('Failed to load results'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { results, loading, error, refetch: fetch };
};

export const useResult = (id) => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetch = useCallback(() => {
    if (!id) return;
    getResultApi(id)
      .then(({ data }) => setResult(data.result))
      .catch(() => setError('Result not found'))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => { fetch(); }, [fetch]);

  return { result, setResult, loading, error, refetch: fetch };
};
