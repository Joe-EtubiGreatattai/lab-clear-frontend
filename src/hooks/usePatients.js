import { useState, useEffect, useCallback } from 'react';
import { getPatientsApi } from '../api/patient.api';

const usePatients = (initialSearch = '') => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState(initialSearch);

  const fetch = useCallback((q = search) => {
    setLoading(true);
    getPatientsApi(q)
      .then(({ data }) => setPatients(data.patients))
      .catch(() => setError('Failed to load patients'))
      .finally(() => setLoading(false));
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(() => fetch(search), 300);
    return () => clearTimeout(timer);
  }, [search, fetch]);

  return { patients, loading, error, search, setSearch, refetch: fetch };
};

export default usePatients;
