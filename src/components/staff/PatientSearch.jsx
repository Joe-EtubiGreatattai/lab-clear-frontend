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
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); if (!e.target.value) onSelect(null); }}
          placeholder="Search by name or MRN..."
          className="input-field pl-9"
        />
      </div>

      {open && results.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {results.map((patient) => (
            <button
              key={patient._id}
              type="button"
              onClick={() => handleSelect(patient)}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-left"
            >
              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {patient.firstName} {patient.lastName}
                </p>
                <p className="text-xs text-gray-500">MRN: {patient.mrn}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default PatientSearch;
