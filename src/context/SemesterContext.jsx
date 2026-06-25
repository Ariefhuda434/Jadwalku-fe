import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

const SemesterContext = createContext(null);

export function SemesterProvider({ children }) {
  const [semesters, setSemesters] = useState([]);
  const [activeSemester, setActiveSemester] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchSemesters = useCallback(async () => {
    try {
      const res = await api.get('/semesters');
      setSemesters(res.data);
      const active = res.data.find(s => s.is_active);
      setActiveSemester(active || null);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSemesters();
  }, [fetchSemesters]);

  const switchSemester = useCallback(async (id) => {
    try {
      const res = await api.put(`/semesters/${id}`, { is_active: true });
      setSemesters(prev => prev.map(s => ({
        ...s,
        is_active: s.id === id ? 1 : 0
      })));
      setActiveSemester(res.data);
      return res.data;
    } catch {
      // ignore
    }
  }, []);

  const createSemester = useCallback(async (data) => {
    const res = await api.post('/semesters', data);
    setSemesters(prev => prev.map(s => ({ ...s, is_active: 0 })));
    setSemesters(prev => [res.data, ...prev]);
    setActiveSemester(res.data);
    return res.data;
  }, []);

  const deleteSemester = useCallback(async (id) => {
    await api.delete(`/semesters/${id}`);
    setSemesters(prev => prev.filter(s => s.id !== id));
    if (activeSemester?.id === id) {
      setActiveSemester(null);
    }
  }, [activeSemester]);

  return (
    <SemesterContext.Provider value={{
      semesters, activeSemester, loading,
      switchSemester, createSemester, deleteSemester, refresh: fetchSemesters
    }}>
      {children}
    </SemesterContext.Provider>
  );
}

export function useSemester() {
  const ctx = useContext(SemesterContext);
  if (!ctx) throw new Error('useSemester must be inside SemesterProvider');
  return ctx;
}
