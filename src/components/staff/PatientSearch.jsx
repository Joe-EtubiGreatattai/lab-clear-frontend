import { useState, useEffect, useRef } from 'react';
import { getPatientsApi } from '../../api/patient.api';
import { Search, User } from 'lucide-react';

const PatientSearch = ({ onSelect, selected }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (selected) {
      setQuery(`${selected.firstName} ${selected.lastName} (${selected.mrn})`);
    }
  }, [selected]);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const { data } = await getPatientsApi(query);
        setResults(data.patients);
        setOpen(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (patient) => {
    onSelect(patient);
    setQuery(`${patient.firstName} ${patient.lastName} (${patient.mrn})`);
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); if (!e.target.value) onSelect(null); }}
          placeholder="Search by name or MRN..."
          className="input-field pl-9"
        />
      </div>

      {open && results.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-surface-100 rounded-3xl shadow-modal max-h-72 overflow-y-auto animate-fadeIn group">
          {results.map((patient) => (
            <button
              key={patient._id}
              type="button"
              onClick={() => handleSelect(patient)}
              className="w-full flex items-center gap-4 px-5 py-4 hover:bg-surface-50 text-left transition-all first:rounded-t-3xl last:rounded-b-3xl border-b border-surface-50 last:border-0"
            >
              <div className="w-10 h-10 bg-primary-50 border border-primary-100 rounded-xl flex items-center justify-center flex-shrink-0 text-primary-600">
                <User className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-surface-900 leading-tight">
                  {patient.firstName} {patient.lastName}
                </p>
                <p className="text-[10px] font-bold text-surface-400 uppercase tracking-widest mt-0.5">MRN: <span className="font-mono text-primary-600">{patient.mrn}</span></p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default PatientSearch;
